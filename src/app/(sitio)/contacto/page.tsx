import { Mail, MapPin, Navigation, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { WhatsAppIcon } from '@/components/brand-icons';
import { Leaf } from '@/components/decor';
import { PageBanner } from '@/components/page-banner';
import { StayInfo } from '@/components/stay-info';
import { buttonStyles, Container } from '@/components/ui';
import { getSettings } from '@/lib/api';
import { PHOTOS } from '@/lib/photos';
import { whatsappUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Cómo llegar y contacto',
  description: 'Ubicación del Rancho Porvenir en Mocoa, horarios de llegada y salida, recomendaciones y condiciones de reserva.',
  alternates: { canonical: '/contacto' },
  openGraph: { title: 'Cómo llegar · Rancho Porvenir', url: '/contacto' },
};

async function ContactDetails() {
  await connection();
  const s = await getSettings();
  const rows = [
    s.phone && { Icon: Phone, label: 'Teléfono', value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    s.email && { Icon: Mail, label: 'Correo', value: s.email, href: `mailto:${s.email}` },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href: string }[];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card-papel relative overflow-hidden p-7 sm:p-9" aria-labelledby="ubicacion">
        <Leaf className="absolute -bottom-8 -right-8 size-40 -rotate-12 text-musgo/15" />
        <h2 id="ubicacion" className="flex items-center gap-2 text-2xl">
          <MapPin className="size-6 text-arcilla-700" aria-hidden /> Ubicación
        </h2>
        {s.address ? (
          <p className="mt-3 text-lg">
            {s.address}
            {s.city && <span className="block text-tinta-suave">{s.city}</span>}
          </p>
        ) : (
          <p className="mt-3 text-tinta-suave">Escríbenos y te enviamos la ubicación exacta.</p>
        )}
        <p className="mt-4 leading-relaxed text-tinta-suave">
          ¿Dudas con la ruta? Escríbenos antes de salir y te orientamos.
        </p>
        {s.mapsUrl && (
          <a
            href={s.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.primary} relative mt-6`}
          >
            <Navigation className="size-5" aria-hidden /> Abrir en Google Maps
          </a>
        )}
      </section>

      <section className="card-papel p-7 sm:p-9" aria-labelledby="escribenos">
        <h2 id="escribenos" className="text-2xl">Escríbenos</h2>
        <p className="mt-3 leading-relaxed text-tinta-suave">
          Respondemos por WhatsApp: ahí confirmamos disponibilidad, precios y todos los detalles de tu
          visita.
        </p>
        {s.whatsappNumber && (
          <a
            href={whatsappUrl(s.whatsappNumber, s.whatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonStyles.whatsapp} mt-6`}
          >
            <WhatsAppIcon className="size-5" /> Escribir por WhatsApp
          </a>
        )}
        {rows.length > 0 && (
          <ul className="mt-7 space-y-3 border-t border-dashed border-bosque/25 pt-6">
            {rows.map(({ Icon, label, value, href }) => (
              <li key={label}>
                <a href={href} className="inline-flex items-center gap-3 font-semibold hover:text-arcilla-700">
                  <span className="grid size-10 place-items-center rounded-full bg-musgo/15 text-musgo-700">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-tinta-suave">{label}</span>
                    <span className="break-all">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

async function StayDetails() {
  await connection();
  return <StayInfo settings={await getSettings()} />;
}

export default function ContactPage() {
  return (
    <>
      <PageBanner photo={PHOTOS.carpasNoche} position="50% 65%" eyebrow="Te esperamos" title="Cómo llegar">
        En el piedemonte amazónico, entre montañas y bosque. Escríbenos y te guiamos en el camino.
      </PageBanner>
      <Container className="py-12 sm:py-16">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-arena/60" aria-busy="true" />}>
          <ContactDetails />
        </Suspense>
        <div className="mt-16">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-arena/60" aria-busy="true" />}>
            <StayDetails />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
