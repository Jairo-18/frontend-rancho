import type { Metadata } from 'next';
import { connection } from 'next/server';
import { ProductCard } from '@/components/cards';
import { Reveal } from '@/components/reveal';
import { SafeSection } from '@/components/safe-section';
import { CardGridSkeleton, Container, EmptyState, SectionHeading } from '@/components/ui';
import { getProducts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Productos de la finca',
  description: 'Miel, café, quesos y artesanías hechos en el rancho y la vereda. Agrégalos a tu solicitud.',
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
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Hecho en la finca" title="Productos">
        Lo que producimos en el rancho y lo que hacen nuestros vecinos de la vereda. No vendemos en
        línea: agrégalos a tu solicitud y te los tenemos listos en tu visita.
      </SectionHeading>
      <SafeSection what="los productos" fallback={<CardGridSkeleton count={4} />}>
        <ProductList />
      </SafeSection>
    </Container>
  );
}
