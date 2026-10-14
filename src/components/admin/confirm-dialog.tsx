'use client';

import { TriangleAlert } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { adminButton } from './ui';

interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  /** Texto del botón que confirma, p. ej. "Borrar". */
  confirmLabel?: string;
  /** true = acción destructiva (botón rojo). */
  danger?: boolean;
}

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

/**
 * Diálogo de confirmación del panel (reemplaza `window.confirm`). Usa <dialog>
 * nativo: atrapa el foco, se cierra con Escape y es accesible.
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (!(await confirm({ title: '¿Borrar la foto?', danger: true }))) return;
 *   …
 *   return <>{…}{dialog}</>;
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pending && ref.current && !ref.current.open) ref.current.showModal();
  }, [pending]);

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
      ref.current?.close();
    },
    [pending],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const dialog = pending ? (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        close(false);
      }}
      onClick={(event) => event.target === ref.current && close(false)}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-bosque/15 bg-papel-claro p-0 text-tinta shadow-calida-lg backdrop:bg-selva/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${pending.danger ? 'bg-arcilla/15 text-arcilla-700' : 'bg-musgo/15 text-musgo-700'}`}
          >
            <TriangleAlert className="size-6" aria-hidden />
          </span>
          <div>
            <h2 id="confirm-title" className="text-xl font-semibold">
              {pending.title}
            </h2>
            {pending.message && <div className="mt-1 text-sm text-tinta-suave">{pending.message}</div>}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => close(false)} className={adminButton.secondary} autoFocus>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={
              pending.danger
                ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-arcilla-700 px-4 py-2.5 font-bold text-white transition hover:bg-madera'
                : adminButton.primary
            }
          >
            {pending.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </dialog>
  ) : null;

  return { confirm, dialog };
}
