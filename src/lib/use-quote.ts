'use client';

import { useEffect, useState } from 'react';
import { nightsBetween } from './format';
import type { ApiErrorBody, Quote } from './types';

export type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; quote: Quote }
  | { status: 'error'; message: string };

type Settled = Extract<QuoteState, { status: 'ready' | 'error' }>;

/**
 * Cotización noche por noche desde el backend (vía el proxy /api/v1). Se pide
 * de nuevo al cambiar la cabaña o las fechas; la petición anterior se cancela.
 * El estado se deriva de la clave de la consulta: mientras la respuesta
 * guardada no sea de la clave actual, está "cargando".
 */
export function useQuote(
  roomId: string | null | undefined,
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
): QuoteState {
  const key =
    roomId && checkIn && checkOut && nightsBetween(checkIn, checkOut) > 0
      ? new URLSearchParams({ roomId, checkIn, checkOut }).toString()
      : null;
  const [result, setResult] = useState<{ key: string; state: Settled } | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const settle = (state: Settled) => {
      if (!controller.signal.aborted) setResult({ key, state });
    };
    fetch(`/api/v1/pricing/quote?${key}`, { signal: controller.signal })
      .then(async (res) => {
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const message = (body as ApiErrorBody | null)?.message;
          throw new Error(message ?? 'No pudimos calcular el precio.');
        }
        settle({ status: 'ready', quote: (body as { data: Quote }).data });
      })
      .catch((error: unknown) => {
        settle({
          status: 'error',
          message: error instanceof Error ? error.message : 'No pudimos calcular el precio.',
        });
      });
    return () => controller.abort();
  }, [key]);

  if (!key) return { status: 'idle' };
  if (result?.key !== key) return { status: 'loading' };
  return result.state;
}
