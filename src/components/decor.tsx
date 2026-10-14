import { useId } from 'react';

/**
 * Ilustraciones SVG ligeras en la paleta del rancho (CONTEXT §7): hojas de
 * selva, ramas, follaje y montañas. Todas decorativas (`aria-hidden`).
 */

interface DecorProps {
  className?: string;
}

function Branch({ className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 160 24" className={className} fill="none">
      <path d="M2 12c40 0 80 1 156 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[22, 50, 78, 106, 134].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 12c4-7 11-9 15-8-2 5-8 9-15 8z`} fill="currentColor" opacity={0.85 - i * 0.08} />
          <path d={`M${x + 8} 12c4 7 11 9 15 8-2-5-8-9-15-8z`} fill="currentColor" opacity={0.6 - i * 0.06} />
        </g>
      ))}
    </svg>
  );
}

/** Separador: rama con hojas a ambos lados de una hoja de monstera. */
export function BranchDivider({ className = '' }: DecorProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-musgo ${className}`} aria-hidden>
      <Branch className="h-5 w-28 sm:w-40" />
      <Monstera className="h-7 w-7 shrink-0 text-arcilla" />
      <Branch className="h-5 w-28 -scale-x-100 sm:w-40" />
    </div>
  );
}

/**
 * Hoja de monstera: la marca del rancho. Las rasgaduras se recortan con una
 * máscara, así la hoja se ve bien sobre cualquier fondo.
 */
export function Monstera({ className = '' }: DecorProps) {
  const mask = `monstera-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <mask id={mask}>
        <path
          d="M16 30C6.5 27.5 2.5 19 5 11.5 7.5 4.5 14 2.5 16 7c2-4.5 8.5-2.5 11 4.5 2.5 7.5-1.5 16-11 18.5z"
          fill="white"
        />
        <g stroke="black" strokeWidth="1.7" strokeLinecap="round">
          <path d="M16 8.5V29" strokeWidth="1.1" />
          <path d="M4.5 13.5 11 15.5M5 20.5l7-1.5M8.5 26l5-3.5M27.5 13.5 21 15.5M27 20.5l-7-1.5M23.5 26l-5-3.5" />
        </g>
        <circle cx="10.5" cy="11" r="1.3" fill="black" />
        <circle cx="21.5" cy="11" r="1.3" fill="black" />
      </mask>
      <rect width="32" height="32" fill="currentColor" mask={`url(#${mask})`} />
    </svg>
  );
}

export function Leaf({ className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <path d="M8 40C8 18 22 8 42 6c-1 21-12 34-34 34z" fill="currentColor" />
      <path d="M10 38C18 28 26 20 36 12" stroke="var(--color-papel-claro)" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** Franja de montañas para separar secciones (el color lo da `text-*`). */
export function MountainsEdge({ className = '' }: DecorProps) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={`block h-12 w-full sm:h-16 ${className}`}
      aria-hidden
    >
      <path
        d="M0 90V58l90-30 70 22 110-44 120 50 80-26 140 46 90-34 130 40 120-58 110 44 90-20 120 36 90-24 70 18 L1440 58 V90 H0z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M0 90V70l120-24 100 22 140-30 110 34 150-26 120 30 130-36 140 32 110-18 120 26 100-12 L1440 70 V90 H0z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Borde de copas de árboles para cerrar secciones (el color lo da `text-*`).
 * Dos capas de follaje a distinta altura, como la selva vista de lejos.
 */
export function CanopyEdge({ className = '' }: DecorProps) {
  const layer = (widths: number[], base: number, rise: number) => {
    let x = 0;
    let d = `M0 90V${base}`;
    for (const [i, w] of widths.entries()) {
      const h = rise + ((i * 7) % 4) * 6;
      d += `c${w * 0.15}-${h} ${w * 0.85}-${h} ${w} 0`;
      x += w;
    }
    return `${d}L${x} 90z`;
  };
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className={`block h-12 w-full sm:h-16 ${className}`}
      aria-hidden
    >
      <path
        d={layer([70, 110, 90, 130, 80, 120, 100, 90, 140, 80, 110, 95, 125, 100], 52, 26)}
        fill="var(--color-musgo)"
      />
      <path
        d={layer([95, 80, 125, 100, 90, 140, 85, 115, 100, 130, 90, 120, 100, 70], 68, 20)}
        fill="currentColor"
      />
    </svg>
  );
}

/** Silueta de caballo al paso (cabalgatas). */
export function HorseSilhouette({ className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M95 12c-3-1-6 0-8 2l-5-6-1 7c-6 2-11 7-15 13-9-2-26-2-37 3-7 3-11 9-12 16-1 4-4 7-8 8l1 3c6 0 10-4 12-8 1 6 4 11 9 14l-4 20h6l5-17c6 2 14 3 21 2l3 15h6l-2-17c5-2 9-5 11-9l7 26h6l-5-30c3-5 4-11 4-16l9-6c4-3 7-2 9 1l4 5 4-3-6-12c-1-4-3-8-6-10z"
      />
    </svg>
  );
}
