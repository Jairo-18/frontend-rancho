'use client';

import { Plus, Trash2 } from 'lucide-react';
import { collapseSpaces } from '@/lib/admin-input';
import { adminButton, inputClass } from './ui';

/**
 * Lista editable fila por fila (recomendaciones, normas…): cada elemento en su
 * propia casilla, con «Agregar» y una X para quitar. Más claro que «una por
 * línea» en un solo cuadro de texto.
 */
export function ListEditor({
  id,
  value,
  onChange,
  addLabel,
  placeholder,
  max = 20,
}: {
  id: string;
  value: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
  max?: number;
}) {
  const update = (i: number, text: string) => onChange(value.map((item, j) => (j === i ? collapseSpaces(text) : item)));
  return (
    <div className="mt-1.5 space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3 grid size-6 shrink-0 place-items-center rounded-full bg-musgo/15 text-xs font-bold text-musgo-700">
            {i + 1}
          </span>
          <textarea
            id={i === 0 ? id : undefined}
            rows={1}
            value={item}
            onChange={(e) => update(i, e.target.value.replace(/\n/g, ' '))}
            placeholder={placeholder}
            maxLength={400}
            className={`${inputClass} mt-0 min-h-11 resize-y [field-sizing:content]`}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className={`${adminButton.icon} mt-0.5 hover:text-arcilla-700`}
          >
            <Trash2 className="size-4" aria-hidden />
            <span className="sr-only">Quitar el punto {i + 1}</span>
          </button>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, ''])} className={adminButton.secondary}>
          <Plus className="size-4" aria-hidden /> {addLabel}
        </button>
      )}
    </div>
  );
}

/** "Título: texto" ↔ { title, text } para las condiciones de reserva. */
export function splitTerm(term: string): { title: string; text: string } {
  const index = term.indexOf(':');
  if (index <= 0 || index > 40) return { title: '', text: term };
  return { title: term.slice(0, index).trim(), text: term.slice(index + 1).trim() };
}
export function joinTerm(title: string, text: string): string {
  return title.trim() ? `${title.trim()}: ${text}` : text;
}

/** Condiciones de reserva: cada una con su título corto y el detalle, en dos casillas. */
export function TermsEditor({
  id,
  value,
  onChange,
  max = 20,
}: {
  id: string;
  value: string[];
  onChange: (items: string[]) => void;
  max?: number;
}) {
  const update = (i: number, patch: Partial<{ title: string; text: string }>) =>
    onChange(
      value.map((item, j) => {
        if (j !== i) return item;
        const current = splitTerm(item);
        const next = { ...current, ...patch };
        return joinTerm(collapseSpaces(next.title).replace(/:/g, ''), collapseSpaces(next.text));
      }),
    );
  return (
    <div className="mt-1.5 space-y-3">
      {value.map((item, i) => {
        const { title, text } = splitTerm(item);
        return (
          <div key={i} className="rounded-xl border-2 border-arena bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                id={i === 0 ? id : undefined}
                value={title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Título, ej.: Para reservar"
                maxLength={40}
                aria-label={`Título de la condición ${i + 1}`}
                className={`${inputClass} mt-0 font-bold`}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className={`${adminButton.icon} hover:text-arcilla-700`}
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Quitar la condición {i + 1}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => update(i, { text: e.target.value.replace(/\n/g, ' ') })}
              placeholder="Detalle, ej.: se separa la fecha con un abono del 50 %."
              maxLength={350}
              aria-label={`Detalle de la condición ${i + 1}`}
              className={`${inputClass} [field-sizing:content]`}
            />
          </div>
        );
      })}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, ''])} className={adminButton.secondary}>
          <Plus className="size-4" aria-hidden /> Agregar condición
        </button>
      )}
    </div>
  );
}
