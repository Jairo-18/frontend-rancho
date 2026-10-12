'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from './admin-api';

export type AdminData<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'error'; data?: undefined; error: string }
  | { status: 'ready'; data: T; error?: undefined };

/**
 * Carga datos del panel por el proxy. `path` null = no cargar todavía.
 * El estado se deriva de la clave (ruta + versión), sin setState síncrono en
 * efectos; `reload()` vuelve a pedir y `mutate()` reemplaza los datos locales
 * tras guardar.
 */
export function useAdminData<T>(path: string | null): AdminData<T> & {
  reload: () => void;
  mutate: (data: T) => void;
} {
  const [version, setVersion] = useState(0);
  const key = path ? `${path}#${version}` : null;
  const [result, setResult] = useState<{ key: string; state: AdminData<T> } | null>(null);

  useEffect(() => {
    if (!key || !path) return;
    let cancelled = false;
    adminFetch<T>(path)
      .then((data) => !cancelled && setResult({ key, state: { status: 'ready', data } }))
      .catch(
        (error: unknown) =>
          !cancelled &&
          setResult({
            key,
            state: {
              status: 'error',
              error: error instanceof Error ? error.message : 'No se pudo cargar',
            },
          }),
      );
    return () => {
      cancelled = true;
    };
  }, [key, path]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const mutate = useCallback(
    (data: T) => key && setResult({ key, state: { status: 'ready', data } }),
    [key],
  );

  const state: AdminData<T> =
    result && result.key === key ? result.state : { status: 'loading' };
  return { ...state, reload, mutate };
}
