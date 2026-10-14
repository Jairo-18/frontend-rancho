'use client';

import { Crop, LoaderCircle, RotateCcw, RotateCw, Sparkles, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { type Adjustments, NO_ADJUSTMENTS, previewFilter, renderEdited } from '@/lib/image-edit';
import { adminButton } from './ui';

const ASPECTS: { label: string; value: number | null }[] = [
  { label: 'Original', value: null },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
];

const SLIDERS: { key: keyof Adjustments; label: string }[] = [
  { key: 'brightness', label: 'Brillo' },
  { key: 'contrast', label: 'Contraste' },
  { key: 'saturation', label: 'Color' },
];

/** Un toque de color para fotos de celular un poco apagadas. */
const ENHANCE: Adjustments = { brightness: 8, contrast: 10, saturation: 18 };

/**
 * Editor de una foto antes de subirla: recorte (con proporciones), zoom, giro y
 * luz/color. Devuelve el archivo editado, el original ("Subir sin editar") o
 * null si se cancela. `remaining` = fotos que esperan después de esta.
 */
export function PhotoEditor({
  file,
  remaining,
  onDone,
  onSkipAll,
}: {
  file: File;
  remaining: number;
  onDone: (result: File | null) => void;
  /** Subir esta y las siguientes sin editar. */
  onSkipAll: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  /** La foto como data URL (no hay object URL que revocar a destiempo). */
  const [src, setSrc] = useState('');
  /** Proporción original de la foto (llega cuando el recortador la carga). */
  const [natural, setNatural] = useState<number | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [adjust, setAdjust] = useState<Adjustments>(NO_ADJUSTMENTS);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
    const reader = new FileReader();
    reader.onload = () => setSrc(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  const touched =
    zoom !== 1 || rotation !== 0 || aspect !== null || adjust.brightness || adjust.contrast || adjust.saturation;

  async function apply() {
    if (!touched) return onDone(file);
    if (!area) return;
    setWorking(true);
    setError(null);
    try {
      onDone(await renderEdited(file, src, area, rotation, adjust));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo editar la foto.');
      setWorking(false);
    }
  }

  function reset() {
    setAspect(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setAdjust(NO_ADJUSTMENTS);
  }

  const chip =
    'rounded-full border-2 px-3 py-1 text-sm font-bold transition aria-pressed:border-bosque aria-pressed:bg-bosque aria-pressed:text-papel-claro border-arena bg-white text-tinta-suave hover:border-bosque';

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!working) onDone(null);
      }}
      aria-labelledby="editor-title"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-papel-claro p-0 text-tinta backdrop:bg-selva/70 sm:m-auto sm:h-[min(52rem,calc(100dvh-2rem))] sm:w-[min(64rem,calc(100vw-2rem))] sm:rounded-2xl sm:shadow-calida-lg"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-bosque/15 px-4 py-3">
          <div className="min-w-0">
            <h2 id="editor-title" className="flex items-center gap-2 text-lg font-semibold">
              <Crop className="size-5 text-musgo-700" aria-hidden /> Editar foto
            </h2>
            <p className="truncate text-xs text-tinta-suave">
              {file.name}
              {remaining > 0 && ` · faltan ${remaining} más`}
            </p>
          </div>
          <button type="button" onClick={() => onDone(null)} disabled={working} className={adminButton.icon}>
            <X className="size-5" aria-hidden />
            <span className="sr-only">Cancelar esta foto</span>
          </button>
        </header>

        <div className="relative min-h-0 flex-1 bg-selva">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect ?? natural ?? 4 / 3}
              onMediaLoaded={(media) => setNatural(media.naturalWidth / media.naturalHeight)}
              minZoom={1}
              maxZoom={4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, pixels) => setArea(pixels)}
              style={{ mediaStyle: { filter: previewFilter(adjust) } }}
              showGrid
            />
          )}
        </div>

        <div className="space-y-4 border-t border-bosque/15 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold">Recorte</span>
            {ASPECTS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                aria-pressed={aspect === value}
                onClick={() => setAspect(value)}
                className={chip}
              >
                {label}
              </button>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-arena sm:block" aria-hidden />
            <button type="button" onClick={() => setRotation((r) => (r - 90 + 360) % 360)} className={adminButton.icon}>
              <RotateCcw className="size-5" aria-hidden />
              <span className="sr-only">Girar a la izquierda</span>
            </button>
            <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} className={adminButton.icon}>
              <RotateCw className="size-5" aria-hidden />
              <span className="sr-only">Girar a la derecha</span>
            </button>
          </div>

          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-bold">
              Zoom
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 block w-full accent-[var(--color-bosque)]"
              />
            </label>
            {SLIDERS.map(({ key, label }) => (
              <label key={key} className="text-sm font-bold">
                <span className="flex justify-between">
                  {label}
                  <span className="font-semibold text-tinta-suave tabular-nums">
                    {adjust[key] > 0 ? '+' : ''}
                    {adjust[key]}
                  </span>
                </span>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  step={1}
                  value={adjust[key]}
                  onChange={(e) => setAdjust((a) => ({ ...a, [key]: Number(e.target.value) }))}
                  onDoubleClick={() => setAdjust((a) => ({ ...a, [key]: 0 }))}
                  className="mt-1 block w-full accent-[var(--color-bosque)]"
                />
              </label>
            ))}
          </div>

          {error && (
            <p role="alert" className="text-sm font-semibold text-arcilla-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdjust(ENHANCE)}
                disabled={working}
                className={adminButton.secondary}
              >
                <Sparkles className="size-4" aria-hidden /> Mejorar color
              </button>
              <button type="button" onClick={reset} disabled={working || !touched} className={adminButton.secondary}>
                Restablecer
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {remaining > 0 && (
                <button type="button" onClick={onSkipAll} disabled={working} className={adminButton.secondary}>
                  Subir todas sin editar
                </button>
              )}
              <button type="button" onClick={() => onDone(file)} disabled={working} className={adminButton.secondary}>
                Subir sin editar
              </button>
              <button type="button" onClick={() => void apply()} disabled={working} className={adminButton.primary}>
                {working ? (
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                ) : (
                  <Upload className="size-5" aria-hidden />
                )}
                {touched ? 'Aplicar y subir' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
