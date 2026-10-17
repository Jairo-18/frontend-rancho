import { ArrowLeft, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Gallery } from '@/components/gallery';
import { AddHorsebackControl } from '@/components/request-buttons';
import { RichText } from '@/components/rich-text';
import { SectionBoundary } from '@/components/section-boundary';
import { BreadcrumbJsonLd } from '@/components/structured-data';
import { Container } from '@/components/ui';
import { getHorsebackRide } from '@/lib/api';
import { formatDuration, formatMoney } from '@/lib/format';
import { toPlainText } from '@/lib/rich-text';

export async function generateMetadata({ params }: PageProps<'/cabalgatas/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const ride = await getHorsebackRide(slug);
  if (!ride) return { title: 'No encontrada' };
  const description = toPlainText(ride.description).slice(0, 160);
  return {
    title: ride.name,
    description,
    alternates: { canonical: `/cabalgatas/${ride.slug}` },
    openGraph: {
      title: ride.name,
      description,
      url: `/cabalgatas/${ride.slug}`,
      images: ride.coverImageUrl ? [{ url: ride.coverImageUrl, alt: ride.name }] : undefined,
    },
  };
}

async function RideDetail({ params }: { params: PageProps<'/cabalgatas/[slug]'>['params'] }) {
  const { slug } = await params;
  const ride = await getHorsebackRide(slug);
  if (!ride) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <BreadcrumbJsonLd
        items={[
          { name: 'Cabalgatas', path: '/cabalgatas' },
          { name: ride.name, path: `/cabalgatas/${ride.slug}` },
        ]}
      />
      <div className="space-y-8">
        <Gallery images={ride.images} title={ride.name} />
        <div>
          <span className="sello bg-papel-claro text-bosque">
            <Clock className="size-4" aria-hidden /> {formatDuration(ride.durationMinutes)}
          </span>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{ride.name}</h1>
          <RichText text={ride.description} className="mt-5 max-w-prose text-lg leading-relaxed text-tinta-suave" />
        </div>
      </div>

      <aside className="card-papel space-y-5 p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Precio y solicitud">
        <p className="font-display text-3xl font-semibold text-madera-900">
          {ride.pricePerPerson === null ? (
            <span className="text-arcilla-700">Consultar precio</span>
          ) : (
            <>
              {formatMoney(ride.pricePerPerson)}{' '}
              <span className="font-sans text-base font-semibold text-tinta-suave">por persona</span>
            </>
          )}
        </p>
        {ride.schedule && (
          <p className="rounded-xl bg-arena/50 px-3 py-2 text-sm text-tinta">
            <span className="font-bold">Horario: </span>
            {ride.schedule}
          </p>
        )}
        <AddHorsebackControl ride={{ id: ride.id, name: ride.name, pricePerPerson: ride.pricePerPerson }} />
      </aside>
    </div>
  );
}

export default function RidePage({ params }: PageProps<'/cabalgatas/[slug]'>) {
  return (
    <Container className="py-8 sm:py-12">
      <Link href="/cabalgatas" className="mb-6 inline-flex items-center gap-1.5 font-bold text-bosque hover:text-arcilla-700">
        <ArrowLeft className="size-4" aria-hidden /> Volver a cabalgatas
      </Link>
      <SectionBoundary what="esta cabalgata">
        <Suspense fallback={<div className="aspect-[4/3] animate-pulse rounded-3xl bg-arena" aria-busy="true" />}>
          <RideDetail params={params} />
        </Suspense>
      </SectionBoundary>
    </Container>
  );
}
