import type { Metadata } from 'next';
import { connection } from 'next/server';
import { ProductCard } from '@/components/cards';
import { Reveal } from '@/components/reveal';
import { SafeSection } from '@/components/safe-section';
import { PageBanner } from '@/components/page-banner';
import { CardGridSkeleton, Container, EmptyState } from '@/components/ui';
import { getProducts } from '@/lib/api';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Productos de la finca',
  description: 'Vino artesanal amazónico y otros productos de la región. Agrégalos a tu solicitud.',
  alternates: { canonical: '/productos' },
  openGraph: { title: 'Productos de la finca · Rancho Porvenir', url: '/productos' },
};

async function ProductList() {
  await connection();
  const products = await getProducts();
  if (products.length === 0) return <EmptyState title="Pronto tendremos productos de la finca" />;
  return (
    <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={(i % 4) * 70}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <PageBanner photo={PHOTOS.picadaTerraza} position="50% 70%" eyebrow="Hecho en la finca" title="Productos">
        Vino artesanal amazónico y otros productos de la región. No vendemos en línea: agrégalos a tu
        solicitud y te los tenemos listos en tu visita.
      </PageBanner>
      <Container className="py-12 sm:py-16">
        <SafeSection what="los productos" fallback={<CardGridSkeleton count={4} />}>
          <ProductList />
        </SafeSection>
      </Container>
    </>
  );
}
