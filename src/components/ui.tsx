import { Bath, CalendarDays, Sun, TriangleAlert, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatMoney } from '@/lib/format';
import { BranchDivider, Leaf } from './decor';

/** Clases de botón compartidas (enlaces y botones). */
export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-bosque px-6 py-3 font-bold text-papel-claro shadow-calida transition duration-200 hover:-translate-y-0.5 hover:bg-bosque-900 hover:shadow-calida-lg disabled:pointer-events-none disabled:opacity-60',
  clay: 'inline-flex items-center justify-center gap-2 rounded-full bg-arcilla-700 px-6 py-3 font-bold text-papel-claro shadow-calida transition duration-200 hover:-translate-y-0.5 hover:bg-madera hover:shadow-calida-lg disabled:pointer-events-none disabled:opacity-60',
  outline:
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-bosque px-6 py-2.5 font-bold text-bosque transition duration-200 hover:-translate-y-0.5 hover:bg-bosque hover:text-papel-claro disabled:pointer-events-none disabled:opacity-60',
  whatsapp:
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#1f7a43] px-6 py-3 font-bold text-white shadow-calida transition duration-200 hover:-translate-y-0.5 hover:bg-[#17633a] hover:shadow-calida-lg disabled:pointer-events-none disabled:opacity-60',
} as const;

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'center',
  as: Tag = 'h2',
}: {
  /** Texto manuscrito sobre el título. */
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2';
}) {
  const centered = align === 'center';
  return (
    <header className={`mb-10 ${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && (
        <p className="font-hand text-2xl text-arcilla-700 sm:text-3xl" lang="es">
          {eyebrow}
        </p>
      )}
      <Tag className="mt-1 text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</Tag>
      {centered && <BranchDivider className="mt-5" />}
      {children && <div className="mt-5 text-lg leading-relaxed text-tinta-suave">{children}</div>}
    </header>
  );
}

/** Insignia con sello artesanal destacando el jacuzzi. */
export function JacuzziBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`sello bg-papel-claro/95 text-arcilla-700 ${className}`}>
      <Bath className="size-4" aria-hidden /> Jacuzzi
    </span>
  );
}

export function CapacityBadge({ capacity }: { capacity: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-suave">
      <Users className="size-4 text-musgo-700" aria-hidden />
      Hasta {capacity} {capacity === 1 ? 'persona' : 'personas'}
    </span>
  );
}

/** Precios entre semana y fin de semana LADO A LADO (CONTEXT §7, UX). */
export function PricePair({
  weekdayPrice,
  weekendPrice,
  size = 'md',
  fridayNightIsWeekend = false,
}: {
  weekdayPrice: number;
  weekendPrice: number;
  size?: 'md' | 'lg';
  fridayNightIsWeekend?: boolean;
}) {
  const big = size === 'lg';
  const cell = `flex flex-col rounded-2xl border border-dashed px-3 ${big ? 'py-4' : 'py-2.5'}`;
  const amount = `font-display font-semibold leading-none ${big ? 'text-2xl sm:text-3xl' : 'text-xl'}`;
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={`${cell} border-musgo-700/40 bg-musgo/10`}>
        <span className="flex items-center gap-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-musgo-700">
          <CalendarDays className="size-3.5" aria-hidden /> Entre semana
        </span>
        <span className={`${amount} mt-1.5 text-bosque`}>{formatMoney(weekdayPrice)}</span>
        <span className="mt-1 text-xs text-tinta-suave">
          por noche · {fridayNightIsWeekend ? 'lun a jue' : 'lun a vie'}
        </span>
      </div>
      <div className={`${cell} border-arcilla-700/40 bg-arcilla/10`}>
        <span className="flex items-center gap-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-arcilla-700">
          <Sun className="size-3.5" aria-hidden /> Fin de semana
        </span>
        <span className={`${amount} mt-1.5 text-madera-900`}>{formatMoney(weekendPrice)}</span>
        <span className="mt-1 text-xs text-tinta-suave">
          por noche · {fridayNightIsWeekend ? 'vie a dom' : 'sáb y dom'}
        </span>
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-papel mx-auto max-w-xl px-6 py-12 text-center">
      <Leaf className="mx-auto size-12 text-musgo" />
      <h2 className="mt-4 text-2xl">{title}</h2>
      {children && <div className="mt-2 text-tinta-suave">{children}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'No pudimos cargar esta información',
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div role="alert" className="card-papel mx-auto max-w-xl px-6 py-12 text-center">
      <TriangleAlert className="mx-auto size-10 text-arcilla-700" aria-hidden />
      <h2 className="mt-4 text-2xl">{title}</h2>
      <div className="mt-2 text-tinta-suave">
        {children ?? (
          <>
            Algo falló de nuestro lado. Intenta recargar la página en un momento o{' '}
            <Link href="/contacto" className="font-bold text-bosque underline">
              escríbenos
            </Link>
            .
          </>
        )}
      </div>
    </div>
  );
}

/** Esqueleto de carga de una grilla de tarjetas. */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card-papel overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-arena" />
          <div className="space-y-3 p-5">
            <div className="h-6 w-2/3 animate-pulse rounded bg-arena" />
            <div className="h-4 w-full animate-pulse rounded bg-arena/70" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-arena/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
