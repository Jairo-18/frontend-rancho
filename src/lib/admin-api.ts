'use client';

import type { ApiErrorBody } from './types';

/**
 * Cliente del panel admin. Todo pasa por el proxy /api/v1 (mismo origen), que
 * agrega el token desde las cookies httpOnly: aquí no se maneja ningún JWT.
 */

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}

// Navegación completa a propósito (aquí y en logout): al perder o cerrar la
// sesión se descarta todo el estado del panel en el navegador.
/* eslint-disable @next/next/no-location-assign-relative-destination */

function goToLogin(): void {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/admin/login?next=${encodeURIComponent(next)}&expirada=1`);
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) goToLogin();
    const error = body as ApiErrorBody | null;
    throw new AdminApiError(
      res.status,
      error?.message ?? 'Algo salió mal. Intenta de nuevo.',
      error?.details ?? [],
    );
  }
  return (body as { data: T }).data;
}

export async function adminFetch<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1/${path.replace(/^\/+/, '')}`, {
      method: options.method ?? 'GET',
      headers: options.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
    });
  } catch {
    throw new AdminApiError(0, 'Sin conexión. Revisa tu internet e intenta de nuevo.');
  }
  return parse<T>(res);
}

/** Sube UN archivo en el campo `file` informando el progreso (0–100). */
export function uploadFile<T>(
  path: string,
  file: File,
  { method = 'POST', onProgress }: { method?: 'POST' | 'PUT'; onProgress?: (percent: number) => void } = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `/api/v1/${path.replace(/^\/+/, '')}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new AdminApiError(0, 'Se cortó la conexión al subir la foto.'));
    xhr.onload = () => {
      const res = new Response(xhr.responseText || null, {
        status: xhr.status,
        headers: { 'content-type': 'application/json' },
      });
      parse<T>(res).then(resolve, reject);
    };
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

export async function logout(): Promise<void> {
  await fetch('/api/session', { method: 'DELETE' }).catch(() => null);
  window.location.assign('/admin/login');
}
/* eslint-enable @next/next/no-location-assign-relative-destination */
