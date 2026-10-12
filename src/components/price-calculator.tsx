'use client';

import { ArrowRight, CalendarDays, Check, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { addDays, formatMoney, nightsBetween, pluralize, todayInBogota } from '@/lib/format';
import { MAX_GUESTS, requestActions, useRequest } from '@/lib/request-store';
import { useQuote } from '@/lib/use-quote';
import type { RequestRoom } from '@/lib/whatsapp';
import { QuoteBreakdown } from './quote-breakdown';
import { Stepper } from './request-buttons';
import { buttonStyles } from './ui';

const MAX_NIGHTS = 30;

export function DateFields({
  checkIn,
  checkOut,
  onChange,
  idPrefix,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  idPrefix: string;
}) {
  const today = todayInBogota();
  const input =
    'mt-1 w-full rounded-xl border-2 border-arena bg-papel-claro px-3 py-2.5 font-semibold text-tinta focus:border-musgo-700 focus:outline-none';
  return (
    <div className="grid grid-cols-2 gap-3">
      <label htmlFor={`${idPrefix}-entrada`} className="text-sm font-bold text-tinta-suave">
        Entrada
        <input
          id={`${idPrefix}-entrada`}
          type="date"
          className={input}
          min={today}
          value={checkIn}
          onChange={(e) => {
            const value = e.target.value;
            // Si la salida queda antes de la entrada, se corre a la noche siguiente.
            const out = checkOut && value && checkOut > value ? checkOut : value ? addDays(value, 1) : checkOut;
            onChange(value, out);
          }}
        />
      </label>
      <label htmlFor={`${idPrefix}-salida`} className="text-sm font-bold text-tinta-suave">
        Salida
        <input
          id={`${idPrefix}-salida`}
          type="date"
          className={input}
          min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
          max={checkIn ? addDays(checkIn, MAX_NIGHTS) : undefined}
          value={checkOut}
          onChange={(e) => onChange(checkIn, e.target.value)}
        />
      </label>
    </div>
  );
}

/**
 * Calculadora del detalle de la cabaña: el elemento más claro de la página
 * (CONTEXT §7). Muestra el desglose noche por noche y permite llevar la cabaña
 * con esas fechas a "Mi solicitud".
 */
export function PriceCalculator({ room, roomSingular }: { room: RequestRoom; roomSingular: string }) {
  const selection = useRequest();
  const sameRoom = selection.room?.id === room.id;
  const [dates, setDates] = useState<{ checkIn: string; checkOut: string } | null>(null);
  // Si ya estaba en la solicitud, arranca con esas fechas.
  const checkIn = dates?.checkIn ?? (sameRoom ? selection.checkIn ?? '' : '');
  const checkOut = dates?.checkOut ?? (sameRoom ? selection.checkOut ?? '' : '');
  const quote = useQuote(room.id, checkIn, checkOut);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const alreadySaved =
    sameRoom && selection.checkIn === checkIn && selection.checkOut === checkOut && Boolean(checkIn);

  return (
    <section aria-labelledby="calculadora" className="card-papel overflow-hidden">
      <div className="bg-bosque px-5 py-4 text-papel-claro sm:px-6">
        <h2 id="calculadora" className="flex items-center gap-2 text-2xl text-papel-claro">
          <CalendarDays className="size-6 text-arena" aria-hidden /> Calcula tu estadía
        </h2>
        <p className="mt-0.5 text-sm text-arena">Elige tus fechas y mira el precio de cada noche.</p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <DateFields
          idPrefix="calc"
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(a, b) => setDates({ checkIn: a, checkOut: b })}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-tinta-suave">Personas</span>
          <Stepper value={selection.guests} onChange={requestActions.setGuests} max={MAX_GUESTS} label="Personas" />
        </div>

        <div aria-live="polite">
          {quote.status === 'idle' && (
            <p className="rounded-2xl border-2 border-dashed border-arena px-4 py-6 text-center text-tinta-suave">
              Selecciona la fecha de entrada y de salida para ver el precio.
            </p>
          )}
          {quote.status === 'loading' && (
            <p className="flex items-center justify-center gap-2 py-6 font-semibold text-tinta-suave">
              <LoaderCircle className="size-5 animate-spin" aria-hidden /> Calculando…
            </p>
          )}
          {quote.status === 'error' && (
            <p role="alert" className="rounded-2xl bg-arcilla/10 px-4 py-3 font-semibold text-arcilla-700">
              {quote.message}
            </p>
          )}
          {quote.status === 'ready' && (
            <div className="space-y-4">
              <QuoteBreakdown quote={quote.quote} />
              <div className="flex items-end justify-between border-t-2 border-bosque pt-3">
                <span className="font-bold">
                  Total estimado
                  <span className="block text-sm font-semibold text-tinta-suave">
                    {pluralize(quote.quote.nightsCount, 'noche', 'noches')}
                  </span>
                </span>
                <span className="font-display text-3xl font-semibold text-bosque">
                  {formatMoney(quote.quote.total)}
                </span>
              </div>
              <p className="text-xs text-tinta-suave">
                Valor estimado en pesos colombianos, sujeto a confirmación por el hotel.
              </p>
            </div>
          )}
        </div>

        {alreadySaved ? (
          <div className="grid gap-2">
            <p role="status" className="flex items-center gap-2 font-bold text-musgo-700">
              <Check className="size-5" aria-hidden /> {roomSingular} y fechas en tu solicitud
            </p>
            <Link href="/solicitud" className={buttonStyles.primary}>
              Ver mi solicitud <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className={`${buttonStyles.primary} w-full`}
            disabled={nights < 1}
            onClick={() => requestActions.setRoom(room, { checkIn, checkOut })}
          >
            Agregar a mi solicitud
          </button>
        )}
      </div>
    </section>
  );
}
