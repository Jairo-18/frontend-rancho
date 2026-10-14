'use client';

import type { StaticImageData } from 'next/image';
import { useEffect, useRef } from 'react';

/**
 * Video corto de ambientación (sin audio). No se descarga hasta que está cerca
 * de la pantalla y solo se reproduce mientras se ve. Con `prefers-reduced-motion`
 * queda quieto en el póster con controles, para que el visitante decida.
 */
export function AmbientVideo({
  src,
  poster,
  label,
  className = '',
}: {
  src: string;
  poster: StaticImageData;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.controls = true;
      return;
    }
    if (!('IntersectionObserver' in window)) {
      void video.play().catch(() => {});
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // El navegador bloqueó la reproducción automática: mostrar controles.
            video.controls = true;
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster.src}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
