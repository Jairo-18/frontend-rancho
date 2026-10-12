'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { RotateCcw, TriangleAlert } from 'lucide-react';

/**
 * Límite de error por sección: si falla, por ejemplo, la carga de productos, el
 * resto de la página sigue funcionando y la sección ofrece reintentar.
 */
function SectionError({ what }: { what: string }, { retry }: ErrorInfo) {
  return (
    <div role="alert" className="card-papel mx-auto max-w-xl px-6 py-10 text-center">
      <TriangleAlert className="mx-auto size-9 text-arcilla-700" aria-hidden />
      <p className="mt-3 font-display text-xl text-bosque">No pudimos cargar {what}</p>
      <p className="mt-1 text-tinta-suave">Puede ser un problema momentáneo de conexión.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-bosque px-5 py-2 font-bold text-bosque hover:bg-bosque hover:text-papel-claro"
      >
        <RotateCcw className="size-4" aria-hidden /> Reintentar
      </button>
    </div>
  );
}

export const SectionBoundary = catchError(SectionError);
