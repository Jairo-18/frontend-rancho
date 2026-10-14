import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { Horseback, Product, Room, Settings } from './types';

/**
 * Cliente del backend. SOLO corre en el servidor de Next: `API_URL` es variable
 * de ejecución (Dokploy), no de build, así que la imagen no depende del backend.
 *
 * Todas las funciones cachean unos minutos (`use cache`): el contenido lo cambia
 * el administrador de vez en cuando y no hace falta pedirlo en cada visita.
 * Las páginas las llaman después de `connection()` para que el build no intente
 * consultar el backend. Los cambios hechos desde el panel invalidan la etiqueta
 * `CATALOG_TAG` (ver el proxy /api/v1), así que se ven de inmediato.
 */

export const CATALOG_TAG = 'catalog';
const API_URL = (process.env.API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiGet<T>(path: string): Promise<T> {
  if (!API_URL) throw new ApiError(500, 'Falta API_URL en el entorno.');
  const res = await fetch(`${API_URL}/${path.replace(/^\/+/, '')}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = ((await res.json()) as { message?: string }).message ?? message;
    } catch {
      /* cuerpo no JSON */
    }
    throw new ApiError(res.status, message);
  }
  return ((await res.json()) as { data: T }).data;
}

export const DEFAULT_SETTINGS: Settings = {
  hotelName: 'Rancho Porvenir',
  logoUrl: '',
  roomLabel: 'Cabañas',
  whatsappNumber: '',
  whatsappGreeting: '¡Hola! Quiero información sobre el Rancho Porvenir.',
  fridayNightIsWeekend: false,
  address: '',
  city: '',
  mapsUrl: '',
  email: '',
  phone: '',
  socials: { instagram: '', facebook: '', tiktok: '' },
  // Si la API falla: horarios y mascotas como en el portafolio del hotel; las
  // listas (recomendaciones, normas, condiciones) se ocultan.
  checkInTime: '3:00 p. m.',
  checkOutTime: '12:00 m.',
  sharedAreas: 'Cocina, kiosko, parrilla y barril asador',
  petsPolicy:
    'Las mascotas son bienvenidas en el rancho, pero no pueden entrar a las cabañas. Su dueño responde por su cuidado y por cualquier daño.',
  recommendations: [],
  houseRules: [],
  bookingTerms: [],
};

async function fetchSettings(): Promise<Settings> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return apiGet<Settings>('settings/public');
}

/**
 * Si el backend no responde, el sitio se pinta con los valores por defecto en
 * vez de caerse. El error se atrapa FUERA de la función cacheada: así un fallo
 * momentáneo no deja los valores por defecto (sin WhatsApp) en caché.
 */
export async function getSettings(): Promise<Settings> {
  try {
    return await fetchSettings();
  } catch (error) {
    console.error('No se pudieron cargar los ajustes:', (error as Error).message);
    return DEFAULT_SETTINGS;
  }
}

export async function getRooms(): Promise<Room[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return apiGet<Room[]>('rooms');
}

/** null si no existe o está inactiva. */
export async function getRoom(slug: string): Promise<Room | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  try {
    return await apiGet<Room>(`rooms/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getHorsebackRides(): Promise<Horseback[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return apiGet<Horseback[]>('horseback');
}

export async function getProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return apiGet<Product[]>('products');
}

/** Busca uno por slug; null si no existe o está inactivo. */
async function getBySlug<T>(resource: string, slug: string): Promise<T | null> {
  try {
    return await apiGet<T>(`${resource}/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getHorsebackRide(slug: string): Promise<Horseback | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return getBySlug<Horseback>('horseback', slug);
}

export async function getProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('minutes');
  cacheTag(CATALOG_TAG);
  return getBySlug<Product>('products', slug);
}
