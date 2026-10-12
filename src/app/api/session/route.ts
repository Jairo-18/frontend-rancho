import { type NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  apiUrl,
  clearSessionCookies,
  REFRESH_COOKIE,
  refreshSession,
  type SessionTokens,
  setSessionCookies,
} from '@/lib/session';

/**
 * Sesión del panel admin:
 *   POST   → iniciar sesión (guarda los tokens en cookies httpOnly)
 *   GET    → usuario actual (renueva si hace falta)
 *   DELETE → cerrar sesión
 */

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ statusCode: 400, message: 'Datos inválidos' }, { status: 400 });
  }

  const headers = new Headers({ 'content-type': 'application/json', accept: 'application/json' });
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl('auth/login'), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { statusCode: 502, message: 'No pudimos conectar con el servidor. Intenta de nuevo.' },
      { status: 502 },
    );
  }

  const payload = (await upstream.json().catch(() => null)) as
    | { data: SessionTokens }
    | { message?: string }
    | null;
  if (!upstream.ok || !payload || !('data' in payload)) {
    return NextResponse.json(
      {
        statusCode: upstream.status,
        message: (payload as { message?: string } | null)?.message ?? 'No se pudo iniciar sesión',
      },
      { status: upstream.ok ? 500 : upstream.status },
    );
  }

  const response = NextResponse.json({ data: { user: payload.data.user } });
  setSessionCookies(response, payload.data);
  return response;
}

export async function GET(request: NextRequest): Promise<Response> {
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let renewed: SessionTokens | null = null;

  if (!access && refresh) {
    renewed = await refreshSession(refresh);
    access = renewed?.accessToken;
  }
  if (!access) {
    const response = NextResponse.json({ statusCode: 401, message: 'Debes iniciar sesión' }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  const upstream = await fetch(apiUrl('auth/me'), {
    headers: { authorization: `Bearer ${access}`, accept: 'application/json' },
    cache: 'no-store',
  }).catch(() => null);
  if (!upstream?.ok) {
    const status = upstream?.status ?? 502;
    const response = NextResponse.json({ statusCode: status, message: 'Sesión no válida' }, { status });
    if (status === 401) clearSessionCookies(response);
    return response;
  }

  const response = NextResponse.json(await upstream.json());
  if (renewed) setSessionCookies(response, renewed);
  return response;
}

export async function DELETE(request: NextRequest): Promise<Response> {
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  // Con el access vencido se renueva para poder invalidar el refresh en el backend.
  if (!access && refresh) access = (await refreshSession(refresh))?.accessToken;
  if (access) {
    // Invalida el refresh token en el backend; si falla, igual se borran las cookies.
    await fetch(apiUrl('auth/logout'), {
      method: 'POST',
      headers: { authorization: `Bearer ${access}` },
      cache: 'no-store',
    }).catch(() => null);
  }
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
