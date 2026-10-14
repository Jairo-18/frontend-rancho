'use client';

import { useState } from 'react';
import { collapseSpaces } from '@/lib/admin-input';

/**
 * Estado de un formulario del panel:
 * - los textos pasan por `collapseSpaces` al escribir (sin espacios dobles);
 * - `dirty` dice si algo cambió desde la última vez que se guardó, para no
 *   habilitar "Guardar" (ni hacer peticiones) sin cambios;
 * - `markSaved` toma los valores actuales como el nuevo punto de partida.
 */
export function useFormState<T extends object>(initial: () => T) {
  const [values, setValues] = useState<T>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(values));

  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setValues((current) => ({
      ...current,
      [key]: typeof value === 'string' ? (collapseSpaces(value) as T[K]) : value,
    }));

  return {
    values,
    setValues,
    set,
    dirty: JSON.stringify(values) !== saved,
    markSaved: (next: T = values) => setSaved(JSON.stringify(next)),
  };
}
