'use client';

import { EntityList } from '@/components/admin/entity-list';
import { NewButton, PageHeader } from '@/components/admin/ui';
import { formatMoney } from '@/lib/format';
import type { AdminProduct } from '@/lib/types';

export default function AdminProductsPage() {
  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo informativo: nombre, precio y una foto."
        action={<NewButton href="/admin/productos/nuevo">Nuevo producto</NewButton>}
      />
      <EntityList<AdminProduct>
        apiPath="products/admin"
        editPath={(product) => `/admin/productos/${product.id}`}
        emptyTitle="Aún no hay productos"
        thumbnail={(product) => product.imageUrl}
        meta={(product) => formatMoney(product.price)}
      />
    </>
  );
}
