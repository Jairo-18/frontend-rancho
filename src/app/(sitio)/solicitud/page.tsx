import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { RequestSummary } from '@/components/request-summary';
import { Container, SectionHeading } from '@/components/ui';
import { getSettings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Mi solicitud',
  description: 'Revisa tu selección, mira el total estimado y envíala por WhatsApp.',
  // Contenido distinto para cada visitante: no se indexa.
  robots: { index: false, follow: true },
};

async function Summary() {
  await connection();
  return <RequestSummary settings={await getSettings()} />;
}

export default function RequestPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Ya casi" title="Mi solicitud">
        Revisa lo que elegiste y envíanoslo por WhatsApp. Te confirmamos disponibilidad y precio final.
      </SectionHeading>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-arena/60" aria-busy="true" />}>
        <Summary />
      </Suspense>
    </Container>
  );
}
