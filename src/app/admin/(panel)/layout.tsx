import { Suspense } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { LoadingBlock } from '@/components/admin/ui';

/** Todo el panel se resuelve en el navegador (datos privados de la sesión). */
export default function PanelLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <Suspense fallback={<LoadingBlock label="Abriendo el panel…" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
