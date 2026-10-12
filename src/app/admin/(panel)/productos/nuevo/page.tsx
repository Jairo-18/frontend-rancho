'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { PageHeader } from '@/components/admin/ui';

export default function NewProductPage() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Nuevo producto" description="Se crea inactivo. Después subes su foto y lo activas." />
      <ProductForm onSaved={(product) => router.replace(`/admin/productos/${product.id}`)} />
    </>
  );
}
