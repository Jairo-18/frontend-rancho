'use client';

import { useAdmin } from '@/components/admin/admin-shell';
import { EntityList } from '@/components/admin/entity-list';
import { NewButton, PageHeader } from '@/components/admin/ui';
import { formatMoney } from '@/lib/format';
import type { AdminRoom } from '@/lib/types';

export default function AdminRoomsPage() {
  const { roomLabel, roomSingular } = useAdmin();
  return (
    <>
      <PageHeader
        title={roomLabel}
        description="Precios, fotos (3 a 5) y estado de cada una."
        action={<NewButton href="/admin/cabanas/nueva">Nueva {roomSingular.toLowerCase()}</NewButton>}
      />
      <EntityList<AdminRoom>
        apiPath="rooms/admin"
        editPath={(room) => `/admin/cabanas/${room.id}`}
        emptyTitle={`Aún no hay ${roomLabel.toLowerCase()}`}
        emptyHint={`Crea la primera con el botón «Nueva ${roomSingular.toLowerCase()}».`}
        thumbnail={(room) => room.coverImageUrl}
        meta={(room) => (
          <>
            {formatMoney(room.weekdayPrice)} entre semana · {formatMoney(room.weekendPrice)} fin de semana ·{' '}
            {room.images.length} {room.images.length === 1 ? 'foto' : 'fotos'}
            {room.hasJacuzzi && ' · jacuzzi'}
          </>
        )}
      />
    </>
  );
}
