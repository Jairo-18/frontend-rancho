'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HorsebackForm } from '@/components/admin/horseback-form';
import { ImageManager } from '@/components/admin/image-manager';
import { StatusPanel } from '@/components/admin/status-panel';
import { ErrorBlock, LoadingBlock, Panel } from '@/components/admin/ui';
import type { AdminHorseback } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';

export default function EditHorsebackPage() {
  const { id } = useParams<{ id: string }>();
  const ride = useAdminData<AdminHorseback>(`horseback/admin/${id}`);

  return (
    <>
      <Link href="/admin/cabalgatas" className="mb-4 inline-flex items-center gap-1.5 font-bold text-bosque">
        <ArrowLeft className="size-4" aria-hidden /> Cabalgatas
      </Link>
      {ride.status === 'loading' && <LoadingBlock />}
      {ride.status === 'error' && <ErrorBlock message={ride.error} onRetry={ride.reload} />}
      {ride.status === 'ready' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{ride.data.name}</h1>
          <StatusPanel<AdminHorseback>
            isActive={ride.data.isActive}
            canActivate={ride.data.images.length >= 1}
            requirement="Sube al menos una foto"
            apiPath={`horseback/${ride.data.id}`}
            publicUrl="/cabalgatas"
            onUpdated={ride.mutate}
            reload={ride.reload}
            name={ride.data.name}
            listHref="/admin/cabalgatas"
          />
          <Panel>
            <h2 className="mb-1 text-xl">Fotos</h2>
            <p className="mb-4 text-sm text-tinta-suave">Hasta 5. Con la primera se publica sola; la primera es la portada.</p>
            <ImageManager<AdminHorseback>
              entityLabel="La cabalgata"
              images={ride.data.images}
              min={1}
              max={5}
              isActive={ride.data.isActive}
              uploadPath={`horseback/${ride.data.id}/images`}
              deletePath={(imageId) => `horseback/${ride.data.id}/images/${imageId}`}
              reorder={{ path: `horseback/${ride.data.id}/images/reorder`, body: (imageIds) => ({ imageIds }) }}
              onUpdated={ride.mutate}
            />
          </Panel>
          <HorsebackForm key={ride.data.updatedAt} ride={ride.data} onSaved={ride.mutate} />
        </div>
      )}
    </>
  );
}
