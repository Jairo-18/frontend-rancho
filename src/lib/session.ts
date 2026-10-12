import 'server-only';
import type { NextResponse } from 'next/server';

/**
 * Sesión del panel admin en cookies httpOnly: el JavaScript del navegador nunca
 * ve los JWT. El proxy /api/v1 agrega el `Authorization` y renueva el access
 * token cuando vence.
 */

export const ACCESS_COOKIE = 'rp_at';
export const REFRESH_COOKIE = 'rp_rt';

const API_URL = (process.env.API_URL ?? '').replace(/\/+$/, '');
const SECURE = (process.env.SITE_URL ?? '').startsWith('https://');
/** Margen para que la cookie del access token desaparezca antes de que el JWT venza. */
const ACCESS_MARGIN_SECONDS = 30;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
}

export function apiUrl(path: string): string {
  return `${API_URL}/${path.replace(/^\/+/, '')}`;
}

export function setSessionCookies(response: NextResponse, tokens: SessionTokens): void {
  const base = { httpOnly: true, secure: SECURE, sameSite: 'strict' as const, path: '/' };
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: Math.max(tokens.expiresIn - ACCESS_MARGIN_SECONDS, 10),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

/**
 * El backend ROTA el refresh token en cada uso: si dos peticiones del panel
 * renuevan a la vez con el mismo token, la segunda fallaría y cerraría la
 * sesión. Se comparte la misma renovación entre peticiones simultáneas y se
 * recuerda el resultado unos segundos.
 */
const inflight = new Map<string, Promise<SessionTokens | null>>();
const REMEMBER_MS = 20_000;

export function refreshSession(refreshToken: string): Promise<SessionTokens | null> {
  const existing = inflight.get(refreshToken);
  if (existing) return existing;
  const promise = (async () => {
    try {
      const res = await fetch(apiUrl('auth/refresh'), {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });
      if (!res.ok) return null;
      return ((await res.json()) as { data: SessionTokens }).data;
    } catch {
      return null;
    }
  })();
  inflight.set(refreshToken, promise);
  setTimeout(() => inflight.delete(refreshToken), REMEMBER_MS);
  return promise;
}
