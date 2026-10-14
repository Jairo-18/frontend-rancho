import Image from 'next/image';
import { Monstera } from './decor';

/**
 * Marca del hotel: el logo subido en Ajustes dentro de un círculo blanco (así se lee
 * sobre los fondos oscuros de selva sin importar sus colores) o, si no hay
 * logo, la hoja de monstera con el nombre. El logo ya trae el nombre, por eso
 * en ese caso el texto solo queda para lectores de pantalla.
 */
export function BrandLogo({
  logoUrl,
  hotelName,
  size = 'md',
  showName = 'never',
}: {
  logoUrl: string;
  hotelName: string;
  size?: 'md' | 'lg';
  /** Nombre del hotel al lado del logo: nunca, solo en escritorio o siempre. */
  showName?: 'never' | 'desktop' | 'always';
}) {
  const large = size === 'lg';
  if (logoUrl) {
    const circle = (
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-calida ring-2 ring-ambar/60 ${large ? 'size-28' : 'size-14'}`}
      >
        <Image
          src={logoUrl}
          alt={showName === 'always' ? '' : hotelName}
          width={large ? 92 : 46}
          height={large ? 62 : 31}
          sizes={large ? '92px' : '46px'}
          className={`h-auto object-contain ${large ? 'w-[5.75rem]' : 'w-[2.9rem]'}`}
        />
      </span>
    );
    if (showName === 'never') return circle;
    return (
      <span className="flex items-center gap-3">
        {circle}
        <span
          className={`whitespace-nowrap font-display text-2xl font-semibold leading-tight text-papel-claro ${showName === 'desktop' ? 'hidden lg:inline' : ''}`}
        >
          {hotelName}
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-selva-700 text-ambar ${large ? 'size-12' : 'size-10'}`}
      >
        <Monstera className={large ? 'size-7' : 'size-6'} />
      </span>
      <span
        className={`whitespace-nowrap font-display font-semibold leading-tight text-papel-claro ${large ? 'text-2xl' : 'text-xl sm:text-2xl'}`}
      >
        {hotelName}
      </span>
    </span>
  );
}
