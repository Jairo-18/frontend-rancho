'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import mark from '@/assets/marca-circulo.png';

/** Tope de espera: con una conexión lenta el sitio se muestra igual. */
const MAX_WAIT_MS = 4000;

/**
 * Pantalla de carga del sitio público: cubre la página en la primera visita
 * hasta que el navegador termina de cargar fotos y fuentes (`load`), y se va
 * con un fundido. Solo en la carga inicial; al navegar entre páginas no sale.
 * Sin JavaScript se oculta con el <noscript> del layout.
 */
export function PageLoader() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'gone'>('visible');

  useEffect(() => {
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      setPhase('leaving');
      window.setTimeout(() => setPhase('gone'), 500);
    };
    if (document.readyState === 'complete') {
      hide();
      return;
    }
    window.addEventListener('load', hide, { once: true });
    const timer = window.setTimeout(hide, MAX_WAIT_MS);
    return () => {
      window.removeEventListener('load', hide);
      window.clearTimeout(timer);
    };
  }, []);

  if (phase === 'gone') return null;
  return (
    <div
      id="cargador"
      role="status"
      aria-live="polite"
      className={`follaje fixed inset-0 z-[100] grid place-items-center transition-opacity duration-500 ${phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-5">
        <span className="cargador-pulso grid size-32 place-items-center rounded-full ring-4 ring-ambar/50 sm:size-36">
          <Image src={mark} alt="" priority className="size-full rounded-full" />
        </span>
        <span className="cargador-puntos flex gap-2" aria-hidden>
          <span className="size-2.5 rounded-full bg-ambar" />
          <span className="size-2.5 rounded-full bg-ambar" />
          <span className="size-2.5 rounded-full bg-ambar" />
        </span>
        <span className="sr-only">Cargando el Rancho Porvenir…</span>
      </div>
    </div>
  );
}
