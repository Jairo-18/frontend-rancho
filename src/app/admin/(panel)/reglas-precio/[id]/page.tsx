'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PriceRuleForm } from '@/components/admin/price-rule-form';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/admin/ui';
import type { PriceRule } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';

export default function EditPriceRulePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const rule = useAdminData<PriceRule>(`price-rules/${id}`);

  return (
    <>
      <Link href="/admin/reglas-precio" className="mb-4 inline-flex items-center gap-1.5 font-bold text-bosque">
        <ArrowLeft className="size-4" aria-hidden /> Precios y festivos
      </Link>
      {rule.status === 'loading' && <LoadingBlock />}
      {rule.status === 'error' && <ErrorBlock message={rule.error} onRetry={rule.reload} />}
      {rule.status === 'ready' && (
        <>
          <PageHeader title={rule.data.name} />
          <PriceRuleForm
            key={rule.data.updatedAt}
            rule={rule.data}
            onSaved={rule.mutate}
            onDeleted={() => router.push('/admin/reglas-precio')}
          />
        </>
      )}
    </>
  );
}
