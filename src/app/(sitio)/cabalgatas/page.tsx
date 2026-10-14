import type { Metadata } from 'next';
import { connection } from 'next/server';
import { HorsebackCard } from '@/components/cards';
import { PageBanner } from '@/components/page-banner';
import { Reveal } from '@/components/reveal';
import { SafeSection } from '@/components/safe-section';
import { CardGridSkeleton, Container, EmptyState } from '@/components/ui';
import { getHorsebackRides } from '@/lib/api';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Cabalgatas',
  description:
    'Cabalgatas guiadas por potreros y bosque con las montañas del Putumayo de fondo. Aptas para principiantes.',
  alternates: { canonical: '/cabalgatas' },
  openGraph: { title: 'Cabalgatas en el Rancho Porvenir', url: '/cabalgatas' },
};

async function RideList() {
  await connection();
  const rides = await getHorsebackRides();
  if (rides.length === 0) {
    return (
      <EmptyState title="Las cabalgatas vuelven pronto">
        Escríbenos por WhatsApp y te contamos cuándo salimos.
      </EmptyState>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rides.map((ride, i) => (
        <Reveal key={ride.id} delay={(i % 3) * 90}>
          <HorsebackCard ride={ride} />
        </Reveal>
      ))}
    </div>
  );
}

export default function HorsebackPage() {
  return (
    <>
      <PageBanner photo={PHOTOS.cabalgataMontana} position="50% 40%" eyebrow="Entre potreros y montaña" title="Cabalgatas">
        Por senderos naturales, con caballo ensillado, guía, instrucciones básicas y seguro médico
        durante el recorrido. Elige cuántas personas van y agrégala a tu solicitud.
      </PageBanner>
      <Container className="py-12 sm:py-16">
        <SafeSection what="las cabalgatas" fallback={<CardGridSkeleton count={2} />}>
          <RideList />
        </SafeSection>
      </Container>
    </>
  );
}
