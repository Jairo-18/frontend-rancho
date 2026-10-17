import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Gallery } from '@/components/gallery';
import { AddProductButton } from '@/components/request-buttons';
import { RichText } from '@/components/rich-text';
import { SectionBoundary } from '@/components/section-boundary';
import { BreadcrumbJsonLd, JsonLd } from '@/components/structured-data';
import { Container } from '@/components/ui';
import { getProduct } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { toPlainText } from '@/lib/rich-text';
import { siteUrl } from '@/lib/site';

export async function generateMetadata({ params }: PageProps<'/productos/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'No encontrado' };
  const description = toPlainText(product.description).slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/productos/${product.slug}`,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined,
    },
  };
}

async function ProductDetail({ params }: { params: PageProps<'/productos/[slug]'>['params'] }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const url = `${siteUrl()}/productos/${product.slug}`;

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
      <BreadcrumbJsonLd
        items={[
          { name: 'Productos', path: '/productos' },
          { name: product.name, path: `/productos/${product.slug}` },
        ]}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: toPlainText(product.description),
          ...(product.imageUrl && { image: product.imageUrl }),
          url,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
            url,
          },
        }}
      />
      <div className="mx-auto w-full max-w-xl">
        {product.imageUrl && <Gallery images={[{ id: product.id, url: product.imageUrl }]} title={product.name} />}
      </div>
      <div className="space-y-5">
        <h1 className="text-4xl font-semibold sm:text-5xl">{product.name}</h1>
        <p className="font-display text-3xl font-semibold text-madera-900">{formatMoney(product.price)}</p>
        <RichText text={product.description} className="max-w-prose text-lg leading-relaxed text-tinta-suave" />
        <div className="max-w-sm">
          <AddProductButton product={{ id: product.id, name: product.name, price: product.price }} />
        </div>
        <p className="text-sm text-tinta-suave">
          No vendemos en línea: agrégalo a tu solicitud y te lo tenemos listo en tu visita.
        </p>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: PageProps<'/productos/[slug]'>) {
  return (
    <Container className="py-8 sm:py-12">
      <Link href="/productos" className="mb-6 inline-flex items-center gap-1.5 font-bold text-bosque hover:text-arcilla-700">
        <ArrowLeft className="size-4" aria-hidden /> Volver a productos
      </Link>
      <SectionBoundary what="este producto">
        <Suspense fallback={<div className="aspect-square max-w-xl animate-pulse rounded-3xl bg-arena" aria-busy="true" />}>
          <ProductDetail params={params} />
        </Suspense>
      </SectionBoundary>
    </Container>
  );
}
