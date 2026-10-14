'use client';

import { Plus, X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { collapseSpaces } from '@/lib/admin-input';

/** Sugerencias frecuentes (tomadas del portafolio del hotel). */
export const AMENITY_SUGGESTIONS = [
  'Jacuzzi con agua caliente',
  'Hidromasajes y espuma',
  'Baño privado',
  'Cama doble',
  'Malla catamarán',
  'Minibar',
  'Wifi',
  'Bafle con Bluetooth',
  'Juegos de mesa',
  'Fogata con masmelos',
  '2 desayunos incluidos',
  'Parqueadero privado para motos',
  'Acceso a cocina',
  'Kiosko y parrilla',
  'Barril asador',
];

/**
 * Campo de etiquetas: se escribe y con Enter (o coma) queda como etiqueta; la
 * X la quita. Debajo, sugerencias para tocar. Así el dueño no necesita saber
 * ningún formato especial ("- Wifi") para que se vea bien en el sitio.
 */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  max = 30,
  maxLength = 60,
  placeholder = 'Escribe y presiona Enter',
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
  maxLength?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const has = (tag: string) => value.some((t) => t.toLocaleLowerCase('es') === tag.toLocaleLowerCase('es'));

  function add(raw: string) {
    const tag = raw.replace(/\s+/g, ' ').trim().replace(/[.;,]$/, '').slice(0, maxLength);
    if (!tag || has(tag) || value.length >= max) return;
    onChange([...value, tag]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
      setDraft('');
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const available = suggestions.filter((s) => !has(s));

  return (
    <div>
      <div
        className="mt-1.5 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border-2 border-arena bg-white px-2.5 py-2 focus-within:border-musgo-700"
        onClick={() => document.getElementById(id)?.focus()}
      >
        {value.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-musgo-700/25 bg-musgo/10 py-1 pl-3 pr-1 text-sm font-semibold text-tinta"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="grid size-6 place-items-center rounded-full text-tinta-suave hover:bg-arcilla/15 hover:text-arcilla-700"
            >
              <X className="size-3.5" aria-hidden />
              <span className="sr-only">Quitar {tag}</span>
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(collapseSpaces(e.target.value).slice(0, maxLength))}
          onKeyDown={onKeyDown}
          onBlur={() => {
            add(draft);
            setDraft('');
          }}
          placeholder={value.length === 0 ? placeholder : 'Agregar otra…'}
          disabled={value.length >= max}
          className="min-w-40 flex-1 border-0 bg-transparent px-1 py-1 text-base outline-none placeholder:text-tinta-suave/60"
        />
      </div>
      {available.length > 0 && value.length < max && (
        <div className="mt-2">
          <p className="mb-1.5 text-xs font-bold text-tinta-suave">Sugerencias: toca para agregar</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-arena bg-white px-2.5 py-1 text-xs font-semibold text-tinta-suave transition hover:border-musgo-700 hover:text-musgo-700"
              >
                <Plus className="size-3" aria-hidden /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
