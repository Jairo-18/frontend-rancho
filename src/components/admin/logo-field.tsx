'use client';

import { ImageUp, LoaderCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, useId, useState } from 'react';
import { AdminApiError, adminFetch, uploadFile } from '@/lib/admin-api';
import type { Settings } from '@/lib/types';
import { Monstera } from '../decor';
import { useToast } from './toast';
import { adminButton } from './ui';

/**
 * Logo del hotel: se sube aparte del formulario (como las fotos) y se guarda de
 * inmediato. Sin logo, el sitio muestra la hoja de monstera con el nombre.
 */
export function LogoField({
  logoUrl,
  hotelName,
  onChange,
}: {
  logoUrl: string;
  hotelName: string;
  onChange: (settings: Settings) => void;
}) {
  const toast = useToast();
  const inputId = useId();
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null);
  const [progress, setProgress] = useState(0);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy('upload');
    setProgress(0);
    try {
      const saved = await uploadFile<Settings>('settings/logo', file, { method: 'PUT', onProgress: setProgress });
      onChange(saved);
      toast('success', 'Logo actualizado: ya se ve en el sitio.');
    } catch (error) {
      toast('error', error instanceof AdminApiError ? error.message : 'No se pudo subir el logo.');
    } finally {
      setBusy(null);
    }
  }

  async function onRemove() {
    if (!window.confirm('¿Quitar el logo? El sitio mostrará la hoja con el nombre del hotel.')) return;
    setBusy('remove');
    try {
      await adminFetch<void>('settings/logo', { method: 'DELETE' });
      const saved = await adminFetch<Settings>('settings/public');
      onChange(saved);
      toast('success', 'Logo quitado.');
    } catch (error) {
      toast('error', error instanceof AdminApiError ? error.message : 'No se pudo quitar el logo.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid h-28 w-full place-items-center rounded-2xl bg-selva p-3 sm:w-56">
        {logoUrl ? (
          <span className="grid size-24 place-items-center rounded-full bg-papel-claro ring-2 ring-ambar/60">
            <Image src={logoUrl} alt={`Logo de ${hotelName}`} width={72} height={48} className="h-auto w-[4.5rem] object-contain" />
          </span>
        ) : (
          <span className="flex items-center gap-2 text-papel-claro">
            <Monstera className="size-8 text-ambar" />
            <span className="font-display text-lg">{hotelName}</span>
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-tinta-suave">
          PNG con fondo transparente o JPG. Se muestra dentro de un círculo crema en el encabezado y el
          pie de página.
        </p>
        <div className="flex flex-wrap gap-2">
          <label htmlFor={inputId} className={`${adminButton.secondary} cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {busy === 'upload' ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <ImageUp className="size-5" aria-hidden />}
            {busy === 'upload' ? `Subiendo… ${progress} %` : logoUrl ? 'Cambiar logo' : 'Subir logo'}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={onFile}
            disabled={busy !== null}
          />
          {logoUrl && (
            <button type="button" onClick={onRemove} disabled={busy !== null} className={adminButton.danger}>
              {busy === 'remove' ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Trash2 className="size-5" aria-hidden />}
              Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
