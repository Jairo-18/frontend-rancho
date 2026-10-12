'use client';

import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/admin/admin-shell';
import { RoomForm } from '@/components/admin/room-form';
import { PageHeader } from '@/components/admin/ui';

export default function NewRoomPage() {
  const router = useRouter();
  const { roomSingular } = useAdmin();
  return (
    <>
      <PageHeader
        title={`Nueva ${roomSingular.toLowerCase()}`}
        description="Se crea inactiva. Después de guardar subes las fotos (mínimo 3) y la activas."
      />
      <RoomForm onSaved={(room) => router.replace(`/admin/cabanas/${room.id}`)} />
    </>
  );
}
