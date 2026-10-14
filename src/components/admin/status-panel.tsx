'use client';

import { ExternalLink, LoaderCircle, Power, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useConfirm } from './confirm-dialog';
import { useToast } from './toast';
import { adminButton, Panel, StatusBadge } from './ui';

/**
 * Activar / desactivar (borrado lógico) desde el detalle. Se activa con PATCH
 * isActive y se desactiva con DELETE, como define la API.
 */
export function StatusPanel<T>({
  isActive,
  canActivate,
  requirement,
  apiPath,
  publicUrl,
  onUpdated,
  reload,
  name,
  listHref,
  deleteWarning,
}: {
  isActive: boolean;
  canActivate: boolean;
  /** Qué falta para poder activarla, p. ej. "Sube al menos 3 fotos". */
  requirement: string;
  apiPath: string;
  publicUrl?: string;
  onUpdated: (entity: T) => void;
  reload: () => void;
  /** Nombre para el diálogo de eliminar. */
  name: string;
  /** Adónde volver después de eliminar. */
  listHref: string;
  /** Qué más se borra (p. ej. reglas de precio de esa cabaña). */
  deleteWarning?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirm();

  async function toggle() {
    if (
      isActive &&
      !(await confirm({
        title: '¿Desactivar?',
        message: 'Dejará de verse en el sitio. Puedes activarla de nuevo cuando quieras.',
        confirmLabel: 'Desactivar',
        danger: true,
      }))
    )
      return;
    setBusy(true);
    try {
      if (isActive) {
        await adminFetch<void>(apiPath, { method: 'DELETE' });
        toast('success', 'Desactivada: ya no se ve en el sitio');
        reload();
      } else {
        onUpdated(await adminFetch<T>(apiPath, { method: 'PATCH', body: { isActive: true } }));
        toast('success', 'Activada: ya se ve en el sitio');
      }
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'No se pudo cambiar el estado.');
    } finally {
      setBusy(false);
    }
  }

  async function removePermanently() {
    const ok = await confirm({
      title: `¿Eliminar «${name}»?`,
      message: (
        <>
          Se borra para siempre, con todas sus fotos{deleteWarning ? `, ${deleteWarning}` : ''}. No se puede
          deshacer. Si solo quieres ocultarla del sitio, usa <strong>Desactivar</strong>.
        </>
      ),
      confirmLabel: 'Eliminar para siempre',
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await adminFetch<void>(`${apiPath}/permanent`, { method: 'DELETE' });
      toast('success', `«${name}» eliminada`);
      router.push(listHref);
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'No se pudo eliminar.');
      setBusy(false);
    }
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl">
            Estado <StatusBadge active={isActive} />
          </h2>
          <p className="mt-1 text-sm text-tinta-suave">
            {isActive
              ? 'Visible en el sitio público.'
              : canActivate
                ? 'Lista para publicar.'
                : `${requirement} para poder activarla.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isActive && publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={adminButton.secondary}>
              <ExternalLink className="size-4" aria-hidden /> Ver en el sitio
            </a>
          )}
          <button
            type="button"
            onClick={() => void toggle()}
            disabled={busy || (!isActive && !canActivate)}
            className={isActive ? adminButton.danger : adminButton.primary}
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Power className="size-4" aria-hidden />}
            {isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button type="button" onClick={() => void removePermanently()} disabled={busy} className={adminButton.danger}>
            <Trash2 className="size-4" aria-hidden /> Eliminar
          </button>
        </div>
      </div>
      {dialog}
    </Panel>
  );
}
