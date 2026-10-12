import { connection } from 'next/server';
import { type ReactNode, Suspense } from 'react';
import { getSettings } from '@/lib/api';
import { singularLabel } from '@/lib/format';
import { SectionBoundary } from './section-boundary';

/** Carga con esqueleto y, si falla, solo esta sección muestra el error. */
export function SafeSection({
  what,
  children,
  fallback,
}: {
  what: string;
  children: ReactNode;
  fallback: ReactNode;
}) {
  return (
    <SectionBoundary what={what}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </SectionBoundary>
  );
}

async function RoomLabelValue({ singular, lower }: { singular: boolean; lower: boolean }) {
  await connection();
  const { roomLabel } = await getSettings();
  const text = singular ? singularLabel(roomLabel) : roomLabel;
  return lower ? text.toLowerCase() : text;
}

/** "Cabañas" o "Habitaciones" según Ajustes (CONTEXT §3.5, `roomLabel`). */
export function RoomLabelText({ singular = false, lower = false }: { singular?: boolean; lower?: boolean }) {
  const fallback = singular ? 'Cabaña' : 'Cabañas';
  return (
    <Suspense fallback={lower ? fallback.toLowerCase() : fallback}>
      <RoomLabelValue singular={singular} lower={lower} />
    </Suspense>
  );
}
