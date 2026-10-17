import { connection } from 'next/server';
import { getRooms, getSettings } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { siteUrl } from '@/lib/site';

/**
 * Datos estructurados (schema.org en JSON-LD) para Google. `<` se escapa para
 * que un texto del panel no pueda cerrar la etiqueta <script>.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}

/** Migas de pan: Inicio › sección › ítem. `path` relativo a la raíz. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const base = siteUrl();
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: 'Inicio', path: '/' }, ...items].map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${base}${item.path === '/' ? '' : item.path}`,
        })),
      }}
    />
  );
}

/** El hotel como negocio de alojamiento (ficha de Google, mapa, redes). */
export async function LodgingJsonLd() {
  await connection();
  const base = siteUrl();
  const [settings, rooms] = await Promise.all([getSettings(), getRooms().catch(() => [])]);
  const prices = rooms.flatMap((room) => [room.weekdayPrice, room.weekendPrice]).filter((p) => p > 0);
  const socials = Object.values(settings.socials ?? {}).filter(Boolean);

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        '@id': `${base}/#hotel`,
        name: settings.hotelName,
        url: base,
        description:
          'Cabañas de madera entre la selva de Mocoa, Putumayo, con jacuzzi, cabalgatas, planes románticos y productos de la finca.',
        image: `${base}/opengraph-image.jpg`,
        ...(settings.logoUrl && { logo: settings.logoUrl }),
        ...(settings.phone && { telephone: settings.phone }),
        ...(settings.email && { email: settings.email }),
        address: {
          '@type': 'PostalAddress',
          ...(settings.address && { streetAddress: settings.address }),
          addressLocality: settings.city || 'Mocoa',
          addressRegion: 'Putumayo',
          addressCountry: 'CO',
        },
        ...(settings.mapsUrl && { hasMap: settings.mapsUrl }),
        ...(socials.length > 0 && { sameAs: socials }),
        ...(prices.length > 0 && {
          priceRange: `${formatMoney(Math.min(...prices))} – ${formatMoney(Math.max(...prices))}`,
        }),
        currenciesAccepted: 'COP',
        petsAllowed: true,
        ...(rooms.length > 0 && {
          containsPlace: rooms.map((room) => ({
            '@type': 'HotelRoom',
            name: room.name,
            url: `${base}/cabanas/${room.slug}`,
            ...(room.capacity && {
              occupancy: { '@type': 'QuantitativeValue', maxValue: room.capacity },
            }),
          })),
        }),
      }}
    />
  );
}
