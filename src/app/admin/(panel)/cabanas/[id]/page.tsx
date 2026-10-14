'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/components/admin/admin-shell';
import { ImageManager } from '@/components/admin/image-manager';
import { RoomForm } from '@/components/admin/room-form';
import { StatusPanel } from '@/components/admin/status-panel';
import { ErrorBlock, LoadingBlock, Panel } from '@/components/admin/ui';
import type { AdminRoom } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';

const MIN_PHOTOS = 1;
const MAX_PHOTOS = 5;

export default function EditRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { roomLabel, roomSingular } = useAdmin();
  const room = useAdminData<AdminRoom>(`rooms/admin/${id}`);

  return (
    <>
      <Link href="/admin/cabanas" className="mb-4 inline-flex items-center gap-1.5 font-bold text-bosque">
        <ArrowLeft className="size-4" aria-hidden /> {roomLabel}
      </Link>
      {room.status === 'loading' && <LoadingBlock />}
      {room.status === 'error' && <ErrorBlock message={room.error} onRetry={room.reload} />}
      {room.status === 'ready' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{room.data.name}</h1>
          <StatusPanel<AdminRoom>
            isActive={room.data.isActive}
            canActivate={room.data.images.length >= MIN_PHOTOS}
            requirement="Sube al menos una foto"
            apiPath={`rooms/${room.data.id}`}
            publicUrl={`/cabanas/${room.data.slug}`}
            onUpdated={room.mutate}
            reload={room.reload}
            name={room.data.name}
            listHref="/admin/cabanas"
            deleteWarning="sus reglas de precio propias y los productos sugeridos (los productos no se borran)"
          />
          <Panel>
            <h2 className="mb-1 text-xl">Fotos</h2>
            <p className="mb-4 text-sm text-tinta-suave">
              Hasta {MAX_PHOTOS}. Con la primera se publica sola. La estrella marca la portada; las flechas cambian el orden.
            </p>
            <ImageManager<AdminRoom>
              entityLabel={`La ${roomSingular.toLowerCase()}`}
              images={room.data.images}
              min={MIN_PHOTOS}
              max={MAX_PHOTOS}
              isActive={room.data.isActive}
              supportsCover
              uploadPath={`rooms/${room.data.id}/images`}
              deletePath={(imageId) => `rooms/${room.data.id}/images/${imageId}`}
              reorder={{
                path: `rooms/${room.data.id}/images/reorder`,
                body: (imageIds, coverImageId) => ({ imageIds, ...(coverImageId && { coverImageId }) }),
              }}
              onUpdated={room.mutate}
            />
          </Panel>
          <RoomForm key={room.data.updatedAt} room={room.data} onSaved={room.mutate} />
        </div>
      )}
    </>
  );
}
