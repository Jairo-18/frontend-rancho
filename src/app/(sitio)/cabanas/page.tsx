import type { Metadata } from 'next';
import { connection } from 'next/server';
import { RoomCard } from '@/components/cards';
import { RoomLabelText, SafeSection } from '@/components/safe-section';
import { CardGridSkeleton, Container, EmptyState, SectionHeading } from '@/components/ui';
import { Reveal } from '@/components/reveal';
import { getRooms, getSettings } from '@/lib/api';
import { singularLabel } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Cabañas',
  description:
    'Cabañas de madera entre montañas, algunas con jacuzzi privado. Precios por noche entre semana y fin de semana, y calculadora de tu estadía.',
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
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Para quedarse" title={<RoomLabelText />}>
        Cada una con su encanto: madera, vista a la montaña y algunas con jacuzzi privado. Mira el precio
        por noche y calcula tu estadía en el detalle.
      </SectionHeading>
      <SafeSection what="el alojamiento" fallback={<CardGridSkeleton count={3} />}>
        <RoomList />
      </SafeSection>
    </Container>
  );
}
