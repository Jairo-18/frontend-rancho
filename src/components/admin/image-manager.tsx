'use client';

import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, RotateCcw, Save, Star, Trash2, TriangleAlert } from 'lucide-react';
import { type DragEvent, useEffect, useRef, useState } from 'react';
import { AdminApiError, adminFetch, uploadFile } from '@/lib/admin-api';
import { useConfirm } from './confirm-dialog';
import { PhotoEditor } from './photo-editor';
import { useToast } from './toast';
import { adminButton } from './ui';

export interface ManagedImage {
  id: string;
  url: string;
  isCover?: boolean;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 15;

interface QueueItem {
  key: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

/**
 * Gestor de fotos del panel (CONTEXT §6.2): arrastrar y soltar o elegir varias,
 * vista previa, subida UNA a UNA con progreso (el backend recibe una foto por
 * petición, como en samawe), reordenar, elegir portada y contador "min–max".
 *
 * `T` es la entidad que devuelve la API tras cada cambio (habitación,
 * cabalgata o producto); se entrega a `onUpdated`.
 */
export function ImageManager<T>({
  entityLabel,
  images,
  min,
  max,
  isActive,
  uploadPath,
  uploadMethod = 'POST',
  deletePath,
  reorder,
  supportsCover = false,
  onUpdated,
}: {
  /** "La cabaña", "La cabalgata"… para los mensajes. */
  entityLabel: string;
  images: ManagedImage[];
  min: number;
  max: number;
  isActive: boolean;
  uploadPath: string;
  uploadMethod?: 'POST' | 'PUT';
  /** null = no se pueden borrar (p. ej. la foto única del producto se reemplaza). */
  deletePath: ((imageId: string) => string) | null;
  /** null = sin reordenar. */
  reorder: { path: string; body: (ids: string[], coverId?: string) => unknown } | null;
  supportsCover?: boolean;
  onUpdated: (entity: T) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const processing = useRef(false);
  const uploadCounter = useRef(0);
  /** Fotos que llegan mientras otra subida está en curso. */
  const pendingRef = useRef<QueueItem[]>([]);
  const replaceMode = max === 1 && uploadMethod === 'PUT';
  const { confirm, dialog } = useConfirm();
  /**
   * Orden y portada en edición: se cambian en pantalla y se guardan juntos con
   * «Guardar orden» (una sola petición). null = sin cambios pendientes.
   */
  const [draft, setDraft] = useState<{ ids: string[]; coverId?: string } | null>(null);
  /** Fotos elegidas que esperan pasar por el editor antes de subirse. */
  const [editing, setEditing] = useState<File[]>([]);

  // Libera las vistas previas al desmontar.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const set = previews.current;
    return () => set.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const pending = queue.filter((item) => !item.error).length;
  const slots = replaceMode ? 1 : max - images.length - pending;

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const errors: string[] = [];
    const accepted: File[] = [];
    for (const file of list) {
      if (!ACCEPTED.includes(file.type)) {
        errors.push(`«${file.name}»: solo se aceptan JPG, PNG o WEBP.`);
      } else if (file.size > MAX_MB * 1024 * 1024) {
        errors.push(`«${file.name}»: pesa más de ${MAX_MB} MB.`);
      } else if (accepted.length + editing.length >= slots) {
        errors.push(`«${file.name}»: ya se alcanzó el máximo de ${max} ${max === 1 ? 'foto' : 'fotos'}.`);
      } else {
        accepted.push(file);
      }
    }
    setRejected(errors);
    if (accepted.length > 0) setEditing((list) => [...list, ...accepted]);
  }

  /** Sube los archivos (ya editados o tal cual) en la cola con progreso. */
  function enqueue(files: File[]) {
    const items = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { key: `upload-${(uploadCounter.current += 1)}`, file, preview, progress: 0 };
    });
    if (items.length === 0) return;
    setQueue((q) => [...q, ...items]);
    void processQueue(items);
  }

  /** Resultado del editor para la primera foto en espera. */
  function onEdited(result: File | null) {
    setEditing(([, ...rest]) => rest);
    if (result) enqueue([result]);
  }

  /** Sube en secuencia: así el contador de 5 nunca se pasa y cada foto muestra su progreso. */
  async function processQueue(items: QueueItem[]) {
    if (processing.current) {
      // Ya hay una subida en curso: los nuevos se agregan a la misma cola.
      pendingRef.current.push(...items);
      return;
    }
    processing.current = true;
    const work = [...items];
    while (work.length > 0) {
      const item = work.shift()!;
      try {
        const entity = await uploadFile<T>(uploadPath, item.file, {
          method: uploadMethod,
          onProgress: (progress) =>
            setQueue((q) => q.map((i) => (i.key === item.key ? { ...i, progress } : i))),
        });
        onUpdated(entity);
        setQueue((q) => q.filter((i) => i.key !== item.key));
        URL.revokeObjectURL(item.preview);
        previews.current.delete(item.preview);
      } catch (error) {
        const message = error instanceof AdminApiError ? error.message : 'No se pudo subir la foto.';
        setQueue((q) => q.map((i) => (i.key === item.key ? { ...i, error: message } : i)));
      }
      work.push(...pendingRef.current.splice(0));
    }
    processing.current = false;
  }
  /** Ejecuta un cambio en la API; devuelve si salió bien. */
  async function run(action: () => Promise<T>, success: string): Promise<boolean> {
    setBusy(true);
    try {
      const entity = await action();
      onUpdated(entity);
      toast('success', success);
      return true;
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'No se pudo guardar el cambio.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  // El borrador solo vale si sigue teniendo exactamente las mismas fotos
  // (si se subió o borró una, se descarta).
  const savedIds = images.map((image) => image.id);
  const savedCover = images.find((image) => image.isCover)?.id;
  const validDraft =
    draft && draft.ids.length === savedIds.length && draft.ids.every((id) => savedIds.includes(id)) ? draft : null;
  const orderedIds = validDraft?.ids ?? savedIds;
  const coverId = validDraft?.coverId ?? savedCover;
  const shown = orderedIds
    .map((id) => images.find((image) => image.id === id))
    .filter((image): image is ManagedImage => Boolean(image))
    .map((image) => ({ ...image, isCover: supportsCover ? image.id === coverId : image.isCover }));
  const orderChanged =
    Boolean(validDraft) &&
    (orderedIds.some((id, i) => id !== savedIds[i]) || (supportsCover && coverId !== savedCover));

  function move(index: number, delta: number) {
    const ids = [...orderedIds];
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    setDraft({ ids, coverId });
  }

  function setCover(id: string) {
    setDraft({ ids: [...orderedIds], coverId: id });
  }

  function saveOrder() {
    if (!reorder || !orderChanged) return;
    void run(
      () =>
        adminFetch<T>(reorder.path, {
          method: 'PATCH',
          body: reorder.body(orderedIds, supportsCover ? coverId : undefined),
        }),
      'Orden guardado',
    ).then((ok) => ok && setDraft(null));
  }

  async function remove(id: string) {
    if (!deletePath) return;
    const ok = await confirm({
      title: '¿Borrar esta foto?',
      message: lastOfActive
        ? `Es la última foto: ${entityLabel.toLowerCase()} quedará oculta en el sitio hasta que subas otra. No se puede deshacer.`
        : 'Se borra del sitio y del servidor. No se puede deshacer.',
      confirmLabel: 'Borrar foto',
      danger: true,
    });
    if (!ok) return;
    void run(() => adminFetch<T>(deletePath(id), { method: 'DELETE' }), 'Foto borrada');
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  const count = images.length;
  const below = count < min;
  /** Borrar la última foto de algo publicado lo deja oculto (se avisa al confirmar). */
  const lastOfActive = isActive && count <= min;

  return (
    <div className="space-y-4">
      {/* Contador */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`font-bold ${below ? 'text-arcilla-700' : 'text-musgo-700'}`}>
          {count} de {min === max ? max : `${min}–${max}`} {max === 1 ? 'foto' : 'fotos'}
        </p>
        {below && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-arcilla-700">
            <TriangleAlert className="size-4" aria-hidden />
            {min - count === 1 ? 'Falta 1 foto' : `Faltan ${min - count} fotos`} para poder activarla
          </p>
        )}
      </div>

      {/* Fotos actuales */}
      {count > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((image, index) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-bosque/15 bg-white">
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniaturas del panel, sin optimizar */}
                <img src={image.url} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-tinta/70 px-2 text-xs font-bold text-white">
                  {index + 1}
                </span>
                {(image.isCover || (!supportsCover && index === 0 && max > 1)) && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-arcilla-700 px-2 py-0.5 text-xs font-bold text-white">
                    Portada
                  </span>
                )}
              </div>
              {(reorder || deletePath) && (
                <div className="flex items-center justify-between px-1 py-1">
                  {reorder && (
                    <>
                      <button type="button" className={adminButton.icon} disabled={busy || index === 0} onClick={() => move(index, -1)}>
                        <ArrowLeft className="size-4" aria-hidden />
                        <span className="sr-only">Mover a la izquierda</span>
                      </button>
                      {supportsCover && (
                        <button
                          type="button"
                          className={`${adminButton.icon} ${image.isCover ? 'text-arcilla-700' : ''}`}
                          disabled={busy || image.isCover}
                          onClick={() => setCover(image.id)}
                          aria-pressed={image.isCover}
                        >
                          <Star className={`size-4 ${image.isCover ? 'fill-current' : ''}`} aria-hidden />
                          <span className="sr-only">{image.isCover ? 'Es la portada' : 'Usar como portada'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className={adminButton.icon}
                        disabled={busy || index === count - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowRight className="size-4" aria-hidden />
                        <span className="sr-only">Mover a la derecha</span>
                      </button>
                    </>
                  )}
                  {deletePath && (
                    <button
                      type="button"
                      className={`${adminButton.icon} hover:text-arcilla-700`}
                      disabled={busy || orderChanged}
                      onClick={() => void remove(image.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">Borrar foto {index + 1}</span>
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {orderChanged && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ambar/15 px-3 py-2.5" role="status">
          <p className="flex-1 text-sm font-semibold text-tinta">Cambiaste el orden o la portada: guarda para aplicarlo.</p>
          <button type="button" onClick={() => setDraft(null)} disabled={busy} className={adminButton.secondary}>
            <RotateCcw className="size-4" aria-hidden /> Deshacer
          </button>
          <button type="button" onClick={saveOrder} disabled={busy} className={adminButton.primary}>
            {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
            Guardar orden
          </button>
        </div>
      )}

      {/* Cola de subida */}
      {queue.length > 0 && (
        <ul className="space-y-2" aria-live="polite">
          {queue.map((item) => (
            <li key={item.key} className="flex items-center gap-3 rounded-xl border border-bosque/15 bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
              <img src={item.preview} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.file.name}</p>
                {item.error ? (
                  <p className="text-sm font-semibold text-arcilla-700">{item.error}</p>
                ) : (
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-arena" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Subiendo ${item.file.name}`}>
                    <div className="h-full bg-musgo-700 transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>
              {item.error ? (
                <button
                  type="button"
                  className={adminButton.icon}
                  onClick={() => {
                    URL.revokeObjectURL(item.preview);
                    setQueue((q) => q.filter((i) => i.key !== item.key));
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  <span className="sr-only">Quitar</span>
                </button>
              ) : (
                <LoaderCircle className="mr-2 size-5 animate-spin text-musgo-700" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}

      {rejected.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl bg-arcilla/10 px-4 py-3 text-sm font-semibold text-arcilla-700">
          {rejected.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {/* Zona para soltar */}
      {slots > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${dragging ? 'border-musgo-700 bg-musgo/10' : 'border-arena bg-white'}`}
        >
          <ImagePlus className="mx-auto size-10 text-musgo-700" aria-hidden />
          <p className="mt-2 font-bold text-tinta">
            {replaceMode && count > 0 ? 'Reemplazar la foto' : 'Arrastra fotos aquí'}
          </p>
          <p className="text-sm text-tinta-suave">
            JPG, PNG o WEBP · hasta {MAX_MB} MB{replaceMode ? '' : ` · puedes agregar ${slots} más`}
          </p>
          <button type="button" onClick={() => inputRef.current?.click()} className={`${adminButton.secondary} mt-4`}>
            Elegir {replaceMode ? 'foto' : 'fotos'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            multiple={!replaceMode}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {dialog}
      {editing.length > 0 && (
        <PhotoEditor
          key={`${editing[0].name}-${editing[0].lastModified}-${editing.length}`}
          file={editing[0]}
          remaining={editing.length - 1}
          onDone={onEdited}
          onSkipAll={() => {
            enqueue(editing);
            setEditing([]);
          }}
        />
      )}
    </div>
  );
}
