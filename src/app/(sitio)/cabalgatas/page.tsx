import type { Metadata } from 'next';
import { connection } from 'next/server';
import { HorsebackCard } from '@/components/cards';
import { HorseSilhouette } from '@/components/decor';
import { Reveal } from '@/components/reveal';
import { SafeSection } from '@/components/safe-section';
import { CardGridSkeleton, Container, EmptyState, SectionHeading } from '@/components/ui';
import { getHorsebackRides } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Cabalgatas',
  description:
    'Cabalgatas guiadas por la montaña: al atardecer, por el bosque y hasta la quebrada. Aptas para principiantes.',
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
    <Container className="py-14 sm:py-20">
      <div className="flex justify-center text-madera/70">
        <HorseSilhouette className="h-16 w-24" />
      </div>
      <SectionHeading as="h1" eyebrow="Al paso del caballo" title="Cabalgatas">
        Siempre con un guía del rancho y caballos mansos. Elige cuántas personas van y agrégala a tu
        solicitud; si aún no tiene precio, te lo confirmamos por WhatsApp.
      </SectionHeading>
      <SafeSection what="las cabalgatas" fallback={<CardGridSkeleton count={2} />}>
        <RideList />
      </SafeSection>
    </Container>
  );
}
