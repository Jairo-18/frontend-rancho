'use client';

import { Check, Clock, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { formatTime, parseTime, type Period, type TimeParts } from '@/lib/admin-input';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];
const DEFAULT: TimeParts = { hour: 3, minute: 0, period: 'pm' };

/**
 * Selector de hora con el estilo del panel: la hora grande en una tarjeta y,
 * al tocar «Cambiar», círculos para la hora, botones para los minutos y
 * mañana / tarde. Guarda el texto como se muestra en el sitio ("3:00 p. m.",
 * mediodía "12:00 m."). Vacío = no se muestra.
 */
export function TimeField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const current = parsed ?? DEFAULT;
  const update = (patch: Partial<TimeParts>) => onChange(formatTime({ ...current, ...patch }));
  const minutes = [...new Set([...MINUTES, current.minute])].sort((a, b) => a - b);

  const chip = (selected: boolean) =>
    `grid place-items-center rounded-full font-bold transition ${
      selected ? 'bg-bosque text-papel-claro shadow-calida' : 'bg-white text-tinta hover:bg-musgo/15 hover:text-bosque'
    }`;

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          id={id}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition ${
            open ? 'border-bosque bg-musgo/10' : 'border-arena bg-white hover:border-musgo-700'
          }`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-selva text-ambar">
            <Clock className="size-5" aria-hidden />
          </span>
          <span>
            <span className={`block font-display text-2xl font-semibold leading-none ${value ? 'text-bosque' : 'text-tinta-suave/60'}`}>
              {value || 'Sin hora'}
            </span>
            <span className="text-xs font-bold text-musgo-700">{open ? 'Elige abajo' : 'Cambiar'}</span>
          </span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-tinta-suave hover:bg-arcilla/10 hover:text-arcilla-700"
          >
            <X className="size-4" aria-hidden /> No mostrar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 max-w-md space-y-4 rounded-2xl border-2 border-bosque/15 bg-papel p-4 shadow-calida">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-tinta-suave">Hora</p>
            <div className="grid grid-cols-6 gap-2">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  aria-pressed={parsed?.hour === hour}
                  onClick={() => update({ hour })}
                  className={`${chip(parsed?.hour === hour)} aspect-square text-lg`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-tinta-suave">Minutos</p>
            <div className="grid grid-cols-4 gap-2">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  aria-pressed={parsed?.minute === minute}
                  onClick={() => update({ minute })}
                  className={`${chip(parsed?.minute === minute)} py-2`}
                >
                  :{String(minute).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['am', 'pm'] as Period[]).map((period) => {
              const selected = parsed?.period === period;
              const Icon = period === 'am' ? Sun : Moon;
              return (
                <button
                  key={period}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ period })}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition ${
                    selected ? 'bg-selva text-ambar shadow-calida' : 'bg-white text-tinta hover:bg-musgo/15'
                  }`}
                >
                  <Icon className="size-5" aria-hidden />
                  {period === 'am' ? 'Mañana (a. m.)' : 'Tarde (p. m.)'}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!parsed) onChange(formatTime(current));
              setOpen(false);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bosque py-2.5 font-bold text-papel-claro transition hover:bg-bosque-900"
          >
            <Check className="size-5" aria-hidden /> Listo · {formatTime(current)}
          </button>
        </div>
      )}
    </div>
  );
}
