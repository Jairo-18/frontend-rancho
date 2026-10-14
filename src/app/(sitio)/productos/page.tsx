import type { Metadata } from 'next';
import { connection } from 'next/server';
import { ProductCard } from '@/components/cards';
import { Reveal } from '@/components/reveal';
import { SafeSection } from '@/components/safe-section';
import { PageBanner } from '@/components/page-banner';
import { Pagination } from '@/components/pagination';
import { CardGridSkeleton, cardGrid, Container, EmptyState } from '@/components/ui';
import { getProducts } from '@/lib/api';
import { paginate } from '@/lib/paginate';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Productos de la finca',
  description: 'Vino artesanal amazónico y otros productos de la región. Agrégalos a tu solicitud.',
  alternates: { canonical: '/productos' },
  openGraph: { title: 'Productos de la finca · Rancho Porvenir', url: '/productos' },
};

async function ProductList({ searchParams }: { searchParams: PageProps<'/productos'>['searchParams'] }) {
  await connection();
  const { pagina } = await searchParams;
  const products = await getProducts();
  if (products.length === 0) return <EmptyState title="Pronto tendremos productos de la finca" />;
  const current = paginate(products, pagina);
  return (
    <>
      <div className={cardGrid.product}>
        {current.items.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 70}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
      <Pagination page={current.page} totalPages={current.totalPages} basePath="/productos" />
    </>
  );
}

export default function ProductsPage({ searchParams }: PageProps<'/productos'>) {
  return (
    <>
      <PageBanner photo={PHOTOS.picadaTerraza} position="50% 70%" eyebrow="Hecho en la finca" title="Productos">
        Vino artesanal amazónico y otros productos de la región. No vendemos en línea: agrégalos a tu solicitud y te los
        tenemos listos en tu visita.
      </PageBanner>
      <Container className="py-12 sm:py-16">
        <SafeSection what="los productos" fallback={<CardGridSkeleton count={4} />}>
          <ProductList searchParams={searchParams} />
        </SafeSection>
      </Container>
    </>
  );
}
