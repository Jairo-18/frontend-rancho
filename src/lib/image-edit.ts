/**
 * Edición de fotos en el navegador antes de subirlas (recorte, giro y ajustes
 * de luz). Las funciones puras están separadas del canvas para poder probarlas.
 */

export interface Adjustments {
  /** -100 … 100 (0 = sin cambio) */
  brightness: number;
  contrast: number;
  saturation: number;
}

export const NO_ADJUSTMENTS: Adjustments = { brightness: 0, contrast: 0, saturation: 0 };

export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Lado máximo de la foto editada: el backend la deja en 1920 px de todos modos. */
export const MAX_SIDE = 2400;

/** Caja que ocupa una imagen de w×h al girarla `degrees`. */
export function rotatedSize(width: number, height: number, degrees: number): { width: number; height: number } {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { width: width * cos + height * sin, height: width * sin + height * cos };
}

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Brillo, contraste y saturación sobre los píxeles RGBA (en el lugar). Se hace
 * a mano y no con `ctx.filter` porque Safari no siempre lo soporta.
 */
export function applyAdjustments(data: Uint8ClampedArray, { brightness, contrast, saturation }: Adjustments): void {
  if (!brightness && !contrast && !saturation) return;
  const b = (brightness / 100) * 255 * 0.5;
  const c = 1 + contrast / 100;
  const s = 1 + saturation / 100;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bl = data[i + 2];
    // Saturación: alejar o acercar cada canal a su gris (luminancia).
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    r = gray + (r - gray) * s;
    g = gray + (g - gray) * s;
    bl = gray + (bl - gray) * s;
    // Contraste alrededor del gris medio, luego brillo.
    data[i] = clamp255((r - 128) * c + 128 + b);
    data[i + 1] = clamp255((g - 128) * c + 128 + b);
    data[i + 2] = clamp255((bl - 128) * c + 128 + b);
  }
}

/** Escala para que el lado mayor no pase de `max`. */
export function fitScale(width: number, height: number, max = MAX_SIDE): number {
  return Math.min(1, max / Math.max(width, height));
}

/** Filtro CSS equivalente (aproximado) para la vista previa en vivo. */
export function previewFilter({ brightness, contrast, saturation }: Adjustments): string {
  return `brightness(${1 + brightness / 200}) contrast(${1 + contrast / 100}) saturate(${1 + saturation / 100})`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo leer la foto.'));
    image.src = src;
  });
}

/**
 * Aplica giro, recorte y ajustes y devuelve un JPEG listo para subir. `area`
 * viene de react-easy-crop (píxeles de la imagen ya girada).
 */
export async function renderEdited(
  file: File,
  src: string,
  area: PixelArea,
  rotation: number,
  adjustments: Adjustments,
): Promise<File> {
  const image = await loadImage(src);
  const box = rotatedSize(image.naturalWidth, image.naturalHeight, rotation);

  // 1) Imagen girada completa.
  const rotated = document.createElement('canvas');
  rotated.width = Math.round(box.width);
  rotated.height = Math.round(box.height);
  const rctx = rotated.getContext('2d');
  if (!rctx) throw new Error('Tu navegador no permite editar fotos.');
  rctx.translate(rotated.width / 2, rotated.height / 2);
  rctx.rotate((rotation * Math.PI) / 180);
  rctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  // 2) Recorte, reducido a MAX_SIDE.
  const scale = fitScale(area.width, area.height);
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(area.width * scale));
  out.height = Math.max(1, Math.round(area.height * scale));
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no permite editar fotos.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, out.width, out.height);

  // 3) Luz y color.
  const pixels = ctx.getImageData(0, 0, out.width, out.height);
  applyAdjustments(pixels.data, adjustments);
  ctx.putImageData(pixels, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) throw new Error('No se pudo guardar la foto editada.');
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
