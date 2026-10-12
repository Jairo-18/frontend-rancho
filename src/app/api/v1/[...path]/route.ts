import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { CATALOG_TAG } from '@/lib/api';
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
 * Proxy del navegador al backend: `/api/v1/*` → `${API_URL}/*`.
 *
 * El navegador nunca conoce la URL del backend (API_URL es variable de
 * ejecución del servidor, no `NEXT_PUBLIC_*`, que quedaría congelada en el
 * build) y no hay CORS que configurar. Lo usan la calculadora de precios y el
 * panel admin: si hay sesión (cookies httpOnly) agrega el `Authorization` y
 * renueva el access token cuando venció. Los cuerpos multipart pasan tal cual.
 */

const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type'];
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'cache-control'];

async function proxy(
  request: NextRequest,
  { params }: RouteContext<'/api/v1/[...path]'>,
): Promise<Response> {
  if (!process.env.API_URL) {
    return NextResponse.json({ statusCode: 500, message: 'Falta API_URL en el entorno.' }, { status: 500 });
  }
  const { path } = await params;
  const target = new URL(apiUrl(path.map(encodeURIComponent).join('/')));
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor);

  // Sesión del panel admin.
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let renewed: SessionTokens | null = null;
  let sessionLost = false;
  if (!access && refresh) {
    renewed = await refreshSession(refresh);
    access = renewed?.accessToken;
    sessionLost = !renewed;
  }
  if (access) headers.set('authorization', `Bearer ${access}`);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Necesario para reenviar el cuerpo como stream (subida de fotos).
      ...(hasBody && { duplex: 'half' }),
      cache: 'no-store',
      redirect: 'manual',
    } as RequestInit);
  } catch {
    return NextResponse.json(
      { statusCode: 502, message: 'No pudimos conectar con el servidor. Intenta de nuevo.' },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  // Un cambio del panel que salió bien: el sitio público deja de usar su caché.
  if (hasBody && upstream.ok) revalidateTag(CATALOG_TAG, { expire: 0 });

  const response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  if (renewed) setSessionCookies(response, renewed);
  if (sessionLost || (upstream.status === 401 && access)) clearSessionCookies(response);
  return response;
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT };
