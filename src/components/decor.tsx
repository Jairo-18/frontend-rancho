/**
 * Ilustraciones SVG ligeras en la paleta del rancho (CONTEXT §7): ramas, hojas,
 * montañas, herraduras y caballos. Todas decorativas (`aria-hidden`).
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

/** Separador: rama con hojas a ambos lados de una herradura. */
export function BranchDivider({ className = '' }: DecorProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-musgo ${className}`} aria-hidden>
      <Branch className="h-5 w-28 sm:w-40" />
      <Horseshoe className="h-7 w-7 shrink-0 text-arcilla" />
      <Branch className="h-5 w-28 -scale-x-100 sm:w-40" />
    </div>
  );
}

export function Horseshoe({ className = '' }: DecorProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path
        d="M8 27V15a8 8 0 0 1 16 0v12"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {[
        [8, 17],
        [8.6, 22],
        [24, 17],
        [23.4, 22],
        [11, 10],
        [21, 10],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill="var(--color-papel-claro)" />
      ))}
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
