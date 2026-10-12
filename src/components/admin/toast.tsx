'use client';

import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

type ToastKind = 'success' | 'error';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<(kind: ToastKind, message: string) => void>(() => {});

/** Avisos breves ("Guardado", errores) en la esquina; se anuncian a lectores de pantalla. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((all) => [...all.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl px-4 py-3 font-semibold text-white shadow-calida-lg ${toast.kind === 'success' ? 'bg-bosque' : 'bg-arcilla-700'}`}
          >
            {toast.kind === 'success' ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            )}
            <p className="flex-1">{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} className="opacity-80 hover:opacity-100">
              <X className="size-5" aria-hidden />
              <span className="sr-only">Cerrar aviso</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
