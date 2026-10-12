import { formatDate, formatMoney, pluralize, singularLabel } from './format';
import type { Quote, RoomLabel } from './types';

/**
 * Generador del mensaje de "Mi solicitud" (CONTEXT §3.5). Función pura: recibe
 * la selección y la cotización y devuelve el texto. Nada se guarda en el backend.
 */

export interface RequestRoom {
  id: string;
  slug: string;
  name: string;
  hasJacuzzi: boolean;
}

export interface RequestHorseback {
  id: string;
  name: string;
  /** null = precio por confirmar. */
  pricePerPerson: number | null;
  people: number;
}

export interface RequestProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RequestSelection {
  room: RequestRoom | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  horseback: RequestHorseback[];
  products: RequestProduct[];
}

export interface RequestTotals {
  room: number;
  horseback: number;
  products: number;
  total: number;
  /** Hay cabalgatas sin precio: no suman y se listan "precio por confirmar". */
  hasUnpricedItems: boolean;
}

export function computeTotals(selection: RequestSelection, quote: Quote | null): RequestTotals {
  const room = quote?.total ?? 0;
  const horseback = selection.horseback.reduce(
    (sum, ride) => sum + (ride.pricePerPerson ?? 0) * ride.people,
    0,
  );
  const products = selection.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  return {
    room,
    horseback,
    products,
    total: room + horseback + products,
    hasUnpricedItems: selection.horseback.some((ride) => ride.pricePerPerson === null),
  };
}

export function isSelectionEmpty(selection: RequestSelection): boolean {
  return (
    !selection.room && selection.horseback.length === 0 && selection.products.length === 0
  );
}

export function buildRequestMessage(
  selection: RequestSelection,
  quote: Quote | null,
  roomLabel: RoomLabel,
): string {
  const lines: string[] = ['Hola, quiero consultar disponibilidad:'];

  if (selection.room) {
    const jacuzzi = selection.room.hasJacuzzi ? ' (con jacuzzi)' : '';
    lines.push(`🏡 ${singularLabel(roomLabel)}: ${selection.room.name}${jacuzzi}`);
  }

  if (selection.checkIn && selection.checkOut) {
    const nights = quote?.nightsCount;
    const nightsText = nights ? ` (${pluralize(nights, 'noche', 'noches')})` : '';
    lines.push(
      `📅 Entrada: ${formatDate(selection.checkIn)} · Salida: ${formatDate(selection.checkOut)}${nightsText}`,
    );
  }

  lines.push(`👥 Personas: ${selection.guests}`);

  for (const ride of selection.horseback) {
    const people = pluralize(ride.people, 'persona', 'personas');
    const price =
      ride.pricePerPerson === null
        ? ' (precio por confirmar)'
        : ` · ${formatMoney(ride.pricePerPerson * ride.people)}`;
    lines.push(`🐎 Cabalgata: ${ride.name} x${people}${price}`);
  }

  if (selection.products.length > 0) {
    const items = selection.products.map((p) => `${p.name} x${p.quantity}`).join(', ');
    lines.push(`🛍️ Productos: ${items}`);
  }

  const totals = computeTotals(selection, quote);
  if (totals.total > 0) {
    lines.push(`💰 Total estimado: ${formatMoney(totals.total)} COP`);
    lines.push(
      totals.hasUnpricedItems
        ? '(sujeto a confirmación por el hotel; no incluye lo que tiene precio por confirmar)'
        : '(sujeto a confirmación por el hotel)',
    );
  }

  lines.push('¡Gracias!');
  return lines.join('\n');
}

/** Solo dígitos: wa.me no acepta "+", espacios ni guiones. */
export function whatsappUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
