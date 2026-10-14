import type { Metadata } from 'next';
import { connection } from 'next/server';
import { RoomCard } from '@/components/cards';
import { RoomLabelText, SafeSection } from '@/components/safe-section';
import { PageBanner } from '@/components/page-banner';
import { CardGridSkeleton, Container, EmptyState } from '@/components/ui';
import { Reveal } from '@/components/reveal';
import { getRooms, getSettings } from '@/lib/api';
import { singularLabel } from '@/lib/format';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Cabañas',
  description:
    'Cabañas de madera entre la selva de Mocoa, algunas con jacuzzi privado. Precios por noche entre semana y fin de semana, y calculadora de tu estadía.',
  alternates: { canonical: '/cabanas' },
  openGraph: { title: 'Cabañas del Rancho Porvenir', url: '/cabanas' },
};

async function RoomList() {
  await connection();
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);
  if (rooms.length === 0) {
    return (
      <EmptyState title="Muy pronto">
        Estamos preparando nuestras {settings.roomLabel.toLowerCase()}. Escríbenos por WhatsApp y te
        contamos.
      </EmptyState>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room, i) => (
        <Reveal key={room.id} delay={(i % 3) * 90}>
          <RoomCard
            room={room}
            priority={i < 2}
            roomSingular={singularLabel(settings.roomLabel)}
            fridayNightIsWeekend={settings.fridayNightIsWeekend}
          />
        </Reveal>
      ))}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <>
      <PageBanner photo={PHOTOS.jacuzziCabana} position="50% 55%" eyebrow="Para quedarse" title={<RoomLabelText />}>
        Cada una con su encanto: madera, follaje alrededor y algunas con jacuzzi privado. Mira el
        precio por noche y calcula tu estadía en el detalle.
      </PageBanner>
      <Container className="py-12 sm:py-16">
        <SafeSection what="el alojamiento" fallback={<CardGridSkeleton count={3} />}>
          <RoomList />
        </SafeSection>
      </Container>
    </>
  );
}
