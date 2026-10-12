'use client';

import { EntityList } from '@/components/admin/entity-list';
import { NewButton, PageHeader } from '@/components/admin/ui';
import { formatDuration, formatMoney } from '@/lib/format';
import type { AdminHorseback } from '@/lib/types';

export default function AdminHorsebackPage() {
  return (
    <>
      <PageHeader
        title="Cabalgatas"
        description="Recorridos, duración, precio por persona y fotos (1 a 5)."
        action={<NewButton href="/admin/cabalgatas/nueva">Nueva cabalgata</NewButton>}
      />
      <EntityList<AdminHorseback>
        apiPath="horseback/admin"
        editPath={(ride) => `/admin/cabalgatas/${ride.id}`}
        emptyTitle="Aún no hay cabalgatas"
        thumbnail={(ride) => ride.coverImageUrl}
        meta={(ride) => (
          <>
            {formatDuration(ride.durationMinutes)} ·{' '}
            {ride.pricePerPerson === null ? 'Consultar precio' : `${formatMoney(ride.pricePerPerson)} por persona`}
          </>
        )}
      />
    </>
  );
}
