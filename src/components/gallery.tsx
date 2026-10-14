'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export function Gallery({ images, title }: { images: { id: string; url: string }[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const current = images[Math.min(index, images.length - 1)];
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div
      className="space-y-3"
      role="region"
      aria-roledescription="galería"
      aria-label={`Fotos de ${title}`}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') go(-1);
        if (event.key === 'ArrowRight') go(1);
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-organico)] bg-selva shadow-calida-lg sm:aspect-[4/3]">
        {/* Fondo: la misma foto ampliada y desenfocada, para que las fotos verticales
            u horizontales se vean completas sin franjas vacías. */}
        <Image
          key={`fondo-${current.id}`}
          src={current.url}
          alt=""
          fill
          sizes="64px"
          className="scale-110 object-cover opacity-70 blur-2xl"
          aria-hidden
        />
        <Image
          key={current.id}
          src={current.url}
          alt={`${title}, foto ${index + 1} de ${images.length}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 680px, 100vw"
          className="animate-fade-up object-contain drop-shadow-xl"
        />
        {images.length > 1 && (
          <>
            {[
              { delta: -1, Icon: ChevronLeft, label: 'Foto anterior', side: 'left-3' },
              { delta: 1, Icon: ChevronRight, label: 'Foto siguiente', side: 'right-3' },
            ].map(({ delta, Icon, label, side }) => (
              <button
                key={label}
                type="button"
                onClick={() => go(delta)}
                className={`absolute ${side} top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-papel-claro/90 text-bosque shadow-calida transition hover:bg-papel-claro`}
              >
                <Icon className="size-6" aria-hidden />
                <span className="sr-only">{label}</span>
              </button>
            ))}
            <p className="absolute bottom-3 right-3 rounded-full bg-tinta/70 px-3 py-1 text-sm font-bold text-papel-claro" aria-live="polite">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className="relative block aspect-square w-full overflow-hidden rounded-xl opacity-70 ring-arcilla transition hover:opacity-100 aria-[current=true]:opacity-100 aria-[current=true]:ring-3"
              >
                <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
                <span className="sr-only">Ver foto {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
