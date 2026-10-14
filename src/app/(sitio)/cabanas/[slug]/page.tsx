import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Gallery } from '@/components/gallery';
import { PriceCalculator } from '@/components/price-calculator';
import { SectionBoundary } from '@/components/section-boundary';
import { StayFacts } from '@/components/stay-info';
import { CapacityBadge, Container, JacuzziBadge, PricePair } from '@/components/ui';
import { getRoom, getSettings } from '@/lib/api';
import { singularLabel } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/cabanas/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoom(slug);
  if (!room) return { title: 'No encontrada' };
  const description = room.description.slice(0, 160);
  return {
    title: room.name,
    description,
    alternates: { canonical: `/cabanas/${room.slug}` },
    openGraph: {
      title: room.name,
      description,
      url: `/cabanas/${room.slug}`,
      images: room.coverImageUrl ? [{ url: room.coverImageUrl, alt: room.name }] : undefined,
    },
  };
}

async function RoomDetail({ params }: { params: PageProps<'/cabanas/[slug]'>['params'] }) {
  const { slug } = await params;
  const [room, settings] = await Promise.all([getRoom(slug), getSettings()]);
  if (!room) notFound();
  const roomSingular = singularLabel(settings.roomLabel);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="space-y-8">
        <Gallery images={room.images} title={room.name} />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {room.hasJacuzzi && <JacuzziBadge />}
            {room.capacity && <CapacityBadge capacity={room.capacity} />}
          </div>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{room.name}</h1>
          <div className="mt-5 max-w-prose space-y-4 text-lg leading-relaxed text-tinta-suave">
            {room.description.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="max-w-lg">
          <h2 className="mb-3 text-2xl">Precio por noche</h2>
          <PricePair
            size="lg"
            weekdayPrice={room.weekdayPrice}
            weekendPrice={room.weekendPrice}
            fridayNightIsWeekend={settings.fridayNightIsWeekend}
          />
          <p className="mt-3 text-sm text-tinta-suave">
            En festivos y temporadas especiales la tarifa puede cambiar: la calculadora te muestra el
            precio exacto de cada noche.
          </p>
        </div>
        <div className="max-w-lg">
          <h2 className="mb-3 text-2xl">Bueno saber</h2>
          <StayFacts settings={settings} />
          <Link href="/contacto#antes-de-venir" className="mt-3 inline-block font-bold text-bosque underline underline-offset-4 hover:text-arcilla-700">
            Recomendaciones y condiciones de reserva
          </Link>
        </div>
      </div>

      <div className="lg:sticky lg:top-24">
        <PriceCalculator
          roomSingular={roomSingular}
          room={{ id: room.id, slug: room.slug, name: room.name, hasJacuzzi: room.hasJacuzzi }}
          checkInTime={settings.checkInTime}
          checkOutTime={settings.checkOutTime}
          fridayNightIsWeekend={settings.fridayNightIsWeekend}
        />
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]" aria-busy="true" aria-label="Cargando">
      <div className="aspect-[16/10] animate-pulse rounded-3xl bg-arena" />
      <div className="h-96 animate-pulse rounded-3xl bg-arena/70" />
    </div>
  );
}

export default function RoomPage({ params }: PageProps<'/cabanas/[slug]'>) {
  return (
    <Container className="py-8 sm:py-12">
      <Link
        href="/cabanas"
        className="mb-6 inline-flex items-center gap-1.5 font-bold text-bosque hover:text-arcilla-700"
      >
        <ArrowLeft className="size-4" aria-hidden /> Volver
      </Link>
      <SectionBoundary what="esta cabaña">
        <Suspense fallback={<DetailSkeleton />}>
          <RoomDetail params={params} />
        </Suspense>
      </SectionBoundary>
    </Container>
  );
}
