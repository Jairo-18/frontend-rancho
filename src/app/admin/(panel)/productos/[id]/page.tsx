'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ImageManager } from '@/components/admin/image-manager';
import { ProductForm } from '@/components/admin/product-form';
import { StatusPanel } from '@/components/admin/status-panel';
import { ErrorBlock, LoadingBlock, Panel } from '@/components/admin/ui';
import type { AdminProduct } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useAdminData<AdminProduct>(`products/admin/${id}`);

  return (
    <>
      <Link href="/admin/productos" className="mb-4 inline-flex items-center gap-1.5 font-bold text-bosque">
        <ArrowLeft className="size-4" aria-hidden /> Productos
      </Link>
      {product.status === 'loading' && <LoadingBlock />}
      {product.status === 'error' && <ErrorBlock message={product.error} onRetry={product.reload} />}
      {product.status === 'ready' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.data.name}</h1>
          <StatusPanel<AdminProduct>
            isActive={product.data.isActive}
            canActivate={Boolean(product.data.imageUrl)}
            requirement="Sube su foto"
            apiPath={`products/${product.data.id}`}
            publicUrl="/productos"
            onUpdated={product.mutate}
            reload={product.reload}
            name={product.data.name}
            listHref="/admin/productos"
            deleteWarning="y deja de aparecer en las cabañas donde se sugería"
          />
          <Panel>
            <h2 className="mb-1 text-xl">Foto</h2>
            <p className="mb-4 text-sm text-tinta-suave">Una foto principal. Subir otra la reemplaza.</p>
            <ImageManager<AdminProduct>
              entityLabel="El producto"
              images={product.data.imageUrl ? [{ id: 'principal', url: product.data.imageUrl }] : []}
              min={1}
              max={1}
              isActive={product.data.isActive}
              uploadPath={`products/${product.data.id}/image`}
              uploadMethod="PUT"
              deletePath={null}
              reorder={null}
              onUpdated={product.mutate}
            />
          </Panel>
          <ProductForm key={product.data.updatedAt} product={product.data} onSaved={product.mutate} />
        </div>
      )}
    </>
  );
}
