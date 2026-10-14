import Image from 'next/image';
import { Monstera } from './decor';

/**
 * Marca del hotel: el logo subido en Ajustes sobre una placa crema (así se lee
 * sobre los fondos oscuros de selva sin importar sus colores) o, si no hay
 * logo, la hoja de monstera con el nombre. El logo ya trae el nombre, por eso
 * en ese caso el texto solo queda para lectores de pantalla.
 */
export function BrandLogo({
  logoUrl,
  hotelName,
  size = 'md',
}: {
  logoUrl: string;
  hotelName: string;
  size?: 'md' | 'lg';
}) {
  const large = size === 'lg';
  if (logoUrl) {
    return (
      <span
        className={`inline-flex items-center rounded-2xl bg-papel-claro shadow-calida ${large ? 'px-4 py-2.5' : 'px-2.5 py-1'}`}
      >
        <Image
          src={logoUrl}
          alt={hotelName}
          width={large ? 180 : 92}
          height={large ? 124 : 56}
          sizes={large ? '180px' : '92px'}
          className={`w-auto object-contain ${large ? 'h-20' : 'h-12'}`}
        />
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
