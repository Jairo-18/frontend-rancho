'use client';

import { useRouter } from 'next/navigation';
import { PriceRuleForm } from '@/components/admin/price-rule-form';
import { PageHeader } from '@/components/admin/ui';

export default function NewPriceRulePage() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Nueva regla de precio" description="Para festivos, puentes o temporadas." />
      <PriceRuleForm onSaved={() => router.push('/admin/reglas-precio')} />
    </>
  );
}
