'use client';

import { useSyncExternalStore } from 'react';
import type {
  RequestHorseback,
  RequestProduct,
  RequestRoom,
  RequestSelection,
} from './whatsapp';
import { MAX_NAME_LENGTH } from './whatsapp';

/**
 * "Mi solicitud": vive SOLO en el navegador (CONTEXT §3.5). Se guarda en
 * localStorage para no perderla al navegar; si el navegador no deja guardar
 * (modo privado, almacenamiento bloqueado) funciona igual en memoria.
 */

const STORAGE_KEY = 'rancho-porvenir:solicitud:v1';
export const MAX_GUESTS = 30;
export const MAX_QUANTITY = 50;

const EMPTY: RequestSelection = {
  name: '',
  room: null,
  checkIn: null,
  checkOut: null,
  guests: 2,
  horseback: [],
  products: [],
};

let state: RequestSelection = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value) || min));

function isSelection(value: unknown): value is RequestSelection {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<RequestSelection>;
  return Array.isArray(v.horseback) && Array.isArray(v.products) && typeof v.guests === 'number';
}

function hydrate(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isSelection(parsed)) {
      state = { ...EMPTY, ...parsed };
      if (typeof state.name !== 'string') state = { ...state, name: '' };
    }
  } catch {
    /* almacenamiento no disponible o dato corrupto: se empieza vacío */
  }
}

function setState(update: (current: RequestSelection) => RequestSelection): void {
  hydrate();
  state = update(state);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* sigue funcionando en memoria */
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Otra pestaña cambió la solicitud.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    hydrated = false;
    hydrate();
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): RequestSelection {
  hydrate();
  return state;
}

/** En el servidor (y en el primer render) la solicitud está vacía. */
const getServerSnapshot = (): RequestSelection => EMPTY;

export function useRequest(): RequestSelection {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Ítems de la solicitud (para el contador del encabezado). */
export function countItems(selection: RequestSelection): number {
  return (
    (selection.room ? 1 : 0) +
    selection.horseback.length +
    selection.products.reduce((sum, p) => sum + p.quantity, 0)
  );
}

export const requestActions = {
  setName(name: string): void {
    setState((s) => ({ ...s, name: name.slice(0, MAX_NAME_LENGTH) }));
  },
  setRoom(room: RequestRoom, dates?: { checkIn: string; checkOut: string }): void {
    setState((s) => ({ ...s, room, ...(dates ?? {}) }));
  },
  removeRoom(): void {
    setState((s) => ({ ...s, room: null }));
  },
  setDates(checkIn: string | null, checkOut: string | null): void {
    setState((s) => ({ ...s, checkIn, checkOut }));
  },
  setGuests(guests: number): void {
    setState((s) => ({ ...s, guests: clamp(guests, 1, MAX_GUESTS) }));
  },
  /** Agrega la cabalgata o actualiza sus personas si ya estaba. */
  upsertHorseback(ride: Omit<RequestHorseback, 'people'>, people: number): void {
    const item = { ...ride, people: clamp(people, 1, MAX_GUESTS) };
    setState((s) => ({
      ...s,
      horseback: s.horseback.some((h) => h.id === ride.id)
        ? s.horseback.map((h) => (h.id === ride.id ? item : h))
        : [...s.horseback, item],
    }));
  },
  removeHorseback(id: string): void {
    setState((s) => ({ ...s, horseback: s.horseback.filter((h) => h.id !== id) }));
  },
  /** Agrega el producto o suma a su cantidad si ya estaba. */
  addProduct(product: Omit<RequestProduct, 'quantity'>, quantity = 1): void {
    setState((s) => {
      const existing = s.products.find((p) => p.id === product.id);
      const next = clamp((existing?.quantity ?? 0) + quantity, 1, MAX_QUANTITY);
      return {
        ...s,
        products: existing
          ? s.products.map((p) => (p.id === product.id ? { ...p, quantity: next } : p))
          : [...s.products, { ...product, quantity: next }],
      };
    });
  },
  setProductQuantity(id: string, quantity: number): void {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id ? { ...p, quantity: clamp(quantity, 1, MAX_QUANTITY) } : p,
      ),
    }));
  },
  removeProduct(id: string): void {
    setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  },
  /** Vacía la selección; el nombre se conserva (es de la persona, no del plan). */
  clear(): void {
    setState((s) => ({ ...EMPTY, name: s.name }));
  },
};
