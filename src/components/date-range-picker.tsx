'use client';

import { CalendarDays, ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  type ActiveField,
  compareMonths,
  isDisabled,
  isWeekendNight,
  MONTHS_LONG,
  monthGrid,
  monthOf,
  pickDate,
  shiftMonth,
  WEEK_HEADER,
} from '@/lib/calendar';
import { formatDate, nightsBetween, pluralize, todayInBogota, weekdayName } from '@/lib/format';

/** "2026-10-15" → "jue 15 oct" (sin año, para los botones). */
const shortDate = (date: string) => formatDate(date).replace(/ \d{4}$/, '');

/**
 * Selector de fechas de la estadía: un calendario propio en vez del de cada
 * navegador. Se elige la llegada y luego la salida sobre el mismo mes, con la
 * hora de entrada y salida del hotel a la vista y las noches de fin de semana
 * marcadas (cuestan distinto). Máximo 30 noches; no deja elegir el pasado.
 */
export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  idPrefix,
  checkInTime,
  checkOutTime,
  fridayNightIsWeekend,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
  idPrefix: string;
  checkInTime: string;
  checkOutTime: string;
  fridayNightIsWeekend: boolean;
}) {
  const today = todayInBogota();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ActiveField>('checkIn');
  const [view, setView] = useState(() => monthOf(checkIn || today));
  const [hover, setHover] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  // Cerrar con Escape o tocando fuera.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  function openFor(field: ActiveField) {
    // Sin llegada no hay salida que elegir: se empieza por la llegada.
    const next = field === 'checkOut' && !checkIn ? 'checkIn' : field;
    setActive(next);
    const anchor = next === 'checkOut' ? checkOut || checkIn : checkIn;
    setView(monthOf(anchor || today));
    setOpen(true);
  }

  function choose(date: string) {
    const next = pickDate({ checkIn, checkOut, active }, date);
    onChange(next.checkIn, next.checkOut);
    setActive(next.active);
    setHover(null);
    if (next.done) setOpen(false);
  }

  const state = { checkIn, checkOut, active };
  // Rango a resaltar: el elegido o, mientras se elige la salida, hasta el día bajo el cursor.
  const rangeEnd = active === 'checkOut' && open && hover && checkIn && hover > checkIn ? hover : checkOut;
  const canGoBack = compareMonths(view, monthOf(today)) > 0;

  const field = (kind: ActiveField) => {
    const isIn = kind === 'checkIn';
    const value = isIn ? checkIn : checkOut;
    const time = isIn ? checkInTime : checkOutTime;
    const selected = open && active === kind;
    const Icon = isIn ? LogIn : LogOut;
    return (
      <button
        type="button"
        id={`${idPrefix}-${isIn ? 'entrada' : 'salida'}`}
        onClick={() => (open && active === kind ? setOpen(false) : openFor(kind))}
        aria-expanded={open}
        aria-controls={`${idPrefix}-calendario`}
        className={`flex flex-col rounded-2xl border-2 px-3 py-2.5 text-left transition ${selected ? 'border-bosque bg-musgo/10' : 'border-arena bg-papel-claro hover:border-musgo-700'}`}
      >
        <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-tinta-suave">
          <Icon className="size-3.5" aria-hidden /> {isIn ? 'Llegada' : 'Salida'}
        </span>
        <span className={`mt-0.5 font-display text-lg font-semibold ${value ? 'text-bosque' : 'text-tinta-suave/70'}`}>
          {value ? shortDate(value) : 'Elegir fecha'}
        </span>
        {time && (
          <span className="text-xs font-semibold text-tinta-suave">
            {isIn ? 'desde las' : 'hasta las'} {time}
          </span>
        )}
      </button>
    );
  };

  return (
    <div ref={root} className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {field('checkIn')}
        {field('checkOut')}
      </div>

      {open && (
        <div
          id={`${idPrefix}-calendario`}
          role="dialog"
          aria-label={active === 'checkIn' ? 'Elige el día de llegada' : 'Elige el día de salida'}
          className="rounded-2xl border-2 border-bosque/15 bg-papel-claro p-3 shadow-calida sm:p-4"
        >
          <p className="mb-2 text-center text-sm font-bold text-arcilla-700">
            {active === 'checkIn' ? '¿Qué día llegas?' : '¿Qué día te vas?'}
          </p>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setView(shiftMonth(view, -1))}
              disabled={!canGoBack}
              className="grid size-9 place-items-center rounded-full text-bosque transition hover:bg-musgo/15 disabled:opacity-30"
            >
              <ChevronLeft className="size-5" aria-hidden />
              <span className="sr-only">Mes anterior</span>
            </button>
            <p className="font-display text-lg font-semibold capitalize text-bosque" aria-live="polite">
              {MONTHS_LONG[view.month - 1]} {view.year}
            </p>
            <button
              type="button"
              onClick={() => setView(shiftMonth(view, 1))}
              className="grid size-9 place-items-center rounded-full text-bosque transition hover:bg-musgo/15"
            >
              <ChevronRight className="size-5" aria-hidden />
              <span className="sr-only">Mes siguiente</span>
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-extrabold uppercase text-tinta-suave" aria-hidden>
            {WEEK_HEADER.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1" onPointerLeave={() => setHover(null)}>
            {monthGrid(view).map((date, i) => {
              if (!date) return <span key={`hueco-${i}`} />;
              const disabled = isDisabled(date, state, today);
              const isStart = date === checkIn;
              const isEnd = date === rangeEnd && Boolean(rangeEnd);
              const inRange = Boolean(checkIn && rangeEnd && date > checkIn && date < rangeEnd);
              const weekend = isWeekendNight(date, fridayNightIsWeekend);
              const edge = isStart || isEnd;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={disabled}
                  onClick={() => choose(date)}
                  onPointerEnter={() => setHover(date)}
                  aria-pressed={edge}
                  aria-label={`${weekdayName(date)} ${formatDate(date).split(' ').slice(1).join(' ')}${isStart ? ', llegada' : ''}${isEnd ? ', salida' : ''}`}
                  className={`relative mx-auto grid aspect-square w-full max-w-11 place-items-center text-sm font-bold transition ${
                    edge
                      ? 'rounded-full bg-bosque text-papel-claro shadow-calida'
                      : inRange
                        ? 'bg-musgo/20 text-bosque'
                        : 'rounded-full text-tinta hover:bg-musgo/15'
                  } ${disabled ? 'cursor-not-allowed text-tinta-suave/35 line-through hover:bg-transparent' : ''} ${date === today && !edge ? 'ring-2 ring-inset ring-ambar' : ''}`}
                >
                  {Number(date.slice(8))}
                  {weekend && !disabled && (
                    <span
                      className={`absolute bottom-1 size-1 rounded-full ${edge ? 'bg-ambar' : 'bg-arcilla'}`}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-bosque/20 pt-3 text-xs text-tinta-suave">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-arcilla" aria-hidden /> Noche de fin de semana (tarifa distinta)
            </span>
            {(checkIn || checkOut) && (
              <button
                type="button"
                onClick={() => {
                  onChange('', '');
                  setActive('checkIn');
                }}
                className="font-bold text-bosque underline underline-offset-4 hover:text-arcilla-700"
              >
                Borrar fechas
              </button>
            )}
          </div>
        </div>
      )}

      {nights > 0 && (
        <p className="flex gap-2 rounded-2xl bg-musgo/10 px-3.5 py-2.5 text-sm text-tinta">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-musgo-700" aria-hidden />
          <span>
            <strong>{pluralize(nights, 'noche', 'noches')}.</strong> Llegas el {weekdayName(checkIn)}{' '}
            {shortDate(checkIn).split(' ').slice(1).join(' ')}
            {checkInTime && ` desde las ${checkInTime}`} y sales el {weekdayName(checkOut)}{' '}
            {shortDate(checkOut).split(' ').slice(1).join(' ')}
            {checkOutTime && ` hasta las ${checkOutTime}`}
            {/* "12:00 m." ya trae su punto: no repetirlo. */}
            {checkOutTime.trim().endsWith('.') ? '' : '.'}
          </span>
        </p>
      )}
    </div>
  );
}
