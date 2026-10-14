import { type NextRequest, NextResponse } from 'next/server';

/**
 * Protege el panel: sin cookie de sesión, /admin redirige al login. La
 * validación real del token la hace el backend en cada petición; esto solo
 * evita mostrar pantallas vacías a quien no inició sesión.
 */
const REFRESH_COOKIE = 'rp_rt';
const LOGIN_PATH = '/admin/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  if (pathname === LOGIN_PATH) {
    return hasSession ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }
  if (!hasSession) {
    // Después de entrar siempre se llega al inicio del panel.
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
