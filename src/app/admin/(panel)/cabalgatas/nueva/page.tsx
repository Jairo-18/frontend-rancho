'use client';

import { useRouter } from 'next/navigation';
import { HorsebackForm } from '@/components/admin/horseback-form';
import { PageHeader } from '@/components/admin/ui';

export default function NewHorsebackPage() {
  const router = useRouter();
  return (
    <>
      <PageHeader title="Nueva cabalgata" description="Se crea inactiva. Después subes al menos una foto y la activas." />
      <HorsebackForm onSaved={(ride) => router.replace(`/admin/cabalgatas/${ride.id}`)} />
    </>
  );
}
