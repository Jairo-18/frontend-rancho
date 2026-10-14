import Image from 'next/image';
import type { ReactNode } from 'react';
import type { SitePhoto } from '@/lib/photos';
import { CanopyEdge } from './decor';
import { Container } from './ui';

/**
 * Encabezado de las páginas internas: foto del rancho a todo lo ancho con
 * velo de selva para que el título se lea, y follaje que la une al contenido.
 */
export function PageBanner({
  photo,
  eyebrow,
  title,
  children,
  position = 'center',
}: {
  photo: SitePhoto;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  /** `object-position` de la foto (qué parte se conserva al recortar). */
  position?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-selva">
      <Image
        src={photo.src}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-selva via-selva/70 to-selva/30" />
      <Container className="pb-10 pt-24 sm:pb-14 sm:pt-32">
        <div className="max-w-2xl animate-fade-up">
          <p className="font-hand text-2xl text-ambar sm:text-3xl">{eyebrow}</p>
          <h1 className="mt-1 text-4xl font-semibold text-papel-claro sm:text-5xl lg:text-6xl">{title}</h1>
          {children && (
            <div className="mt-4 text-lg leading-relaxed text-papel/90 sm:text-xl">{children}</div>
          )}
        </div>
      </Container>
      <CanopyEdge className="-mb-px text-papel" />
    </section>
  );
}
