/**
 * Paisaje ilustrado del hero (atardecer en la finca). Reemplazable por una foto
 * real cuando el hotel la entregue; mientras tanto no depende de imágenes
 * externas y pesa unos pocos KB.
 */
export function HeroLandscape({ className = '' }: { className?: string }) {
  const pines = [70, 120, 165, 1180, 1235, 1290, 1340, 1385];
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9b984" />
          <stop offset="0.45" stopColor="#f0cf9f" />
          <stop offset="1" stopColor="#f4ebdc" />
        </linearGradient>
        <radialGradient id="sol" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3dc" />
          <stop offset="0.55" stopColor="#f6d6a3" />
          <stop offset="1" stopColor="#f6d6a3" stopOpacity="0" />
        </radialGradient>
        <pattern id="grano" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#2b2118" opacity="0.06" />
        </pattern>
      </defs>

      <rect width="1440" height="900" fill="url(#cielo)" />
      <circle cx="980" cy="330" r="230" fill="url(#sol)" />
      <circle cx="980" cy="330" r="92" fill="#f7dfb5" />

      {/* Nubes de pincel */}
      <g fill="#faf5ec" opacity="0.55">
        <path d="M180 200c40-26 110-30 150-6 30-14 80-10 100 12-90 10-170 10-250-6z" />
        <path d="M1080 150c30-18 80-20 108-4 22-10 58-6 72 8-64 8-122 8-180-4z" />
      </g>

      {/* Cordilleras lejanas → cercanas */}
      <path d="M0 520 140 430l120 50 150-120 130 90 110-70 160 110 140-90 150 80 120-60 170 100 50-20V900H0z" fill="#b98a62" opacity="0.55" />
      <path d="M0 590 120 520l140 60 170-130 160 120 120-50 180 110 150-90 160 90 130-70 110 60V900H0z" fill="#7a5230" opacity="0.8" />
      <path d="M0 660 160 590l170 70 200-110 180 120 160-70 200 100 170-60 200 70V900H0z" fill="#6b8e4e" />
      <path d="M0 720c180-50 360-60 560-20s420 50 600 0 230-30 280-26V900H0z" fill="#4d6a37" />

      {/* Pinos */}
      <g fill="#2f4a2b">
        {pines.map((x, i) => {
          const h = 110 + ((i * 37) % 60);
          const base = 745 - (i % 3) * 8;
          return (
            <g key={x}>
              <path d={`M${x} ${base - h} l${h * 0.28} ${h} h-${h * 0.56} z`} />
              <rect x={x - 4} y={base} width="8" height="18" fill="#4f341d" />
            </g>
          );
        })}
      </g>

      {/* Potrero con cerca de madera */}
      <path d="M0 790c240-30 520-40 760-24s460 30 680 6V900H0z" fill="#2f4a2b" />
      <g stroke="#7a5230" strokeWidth="7" strokeLinecap="round">
        {[260, 380, 500, 620, 740].map((x) => (
          <line key={x} x1={x} y1="760" x2={x} y2="830" />
        ))}
        <line x1="250" y1="780" x2="750" y2="772" />
        <line x1="250" y1="806" x2="750" y2="800" />
      </g>

      {/* Caballo pastando */}
      <path
        fill="#1e3019"
        d="M968 742c-6-3-13-2-17 3l-8-10-2 12c-11 4-19 13-25 24-16-4-46-4-66 5-13 6-20 16-22 29-2 7-7 12-14 14l2 6c10 0 18-7 21-14 2 11 7 19 16 25l-7 36h11l9-31c11 4 25 5 38 4l5 27h11l-4-31c9-4 16-9 20-16l12 47h11l-9-54c5-9 7-20 7-29l16-11c7-5 13-4 16 2l7 9 7-5-11-22c-2-7-5-14-11-18z"
      />

      <rect width="1440" height="900" fill="url(#grano)" />
    </svg>
  );
}
