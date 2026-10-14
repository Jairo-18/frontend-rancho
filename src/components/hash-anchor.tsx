'use client';

import { useEffect } from 'react';

/** Cuánto tiempo se sigue corrigiendo la posición mientras la página termina de acomodarse. */
const SETTLE_MS = 2500;

/**
 * Lleva a la sección `id` cuando la URL trae su `#hash`. Hace falta porque la
 * sección llega en streaming (Suspense): cuando el navegador intenta saltar,
 * todavía no existe, y en el celular lo de arriba (fotos, tarjetas) cambia de
 * alto al cargar y deja el salto corrido. Se re-alinea mientras la página se
 * acomoda y se detiene en cuanto la persona toca o desplaza la pantalla.
 */
export function HashAnchor({ id }: { id: string }) {
  useEffect(() => {
    if (decodeURIComponent(window.location.hash.slice(1)) !== id) return;
    const target = document.getElementById(id);
    if (!target) return;

    const align = () => target.scrollIntoView({ block: 'start' });
    align();

    const observer = new ResizeObserver(align);
    observer.observe(document.body);
    const stop = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('load', align);
      for (const type of ['wheel', 'touchstart', 'keydown'] as const) window.removeEventListener(type, stop);
    };
    const timer = window.setTimeout(stop, SETTLE_MS);
    window.addEventListener('load', align, { once: true });
    for (const type of ['wheel', 'touchstart', 'keydown'] as const) window.addEventListener(type, stop, { passive: true });
    return stop;
  }, [id]);

  return null;
}
