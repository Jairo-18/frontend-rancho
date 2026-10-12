'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Aparición suave al entrar en pantalla. Con `prefers-reduced-motion` el CSS
 * deja el contenido visible sin animar. Sin JS el contenido también se ve: el
 * estado oculto solo se aplica después de montar.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Retraso en ms (para escalonar tarjetas). */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'visible'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) return;
    setState('hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${state === 'idle' ? '' : 'reveal'} ${className}`}
      data-visible={state === 'visible'}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
