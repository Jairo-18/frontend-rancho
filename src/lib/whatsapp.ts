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
  /** Nombre de quien escribe: el hotel lo ve al abrir el chat. */
  name: string;
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

/** Mínimo de letras del nombre para poder enviar la solicitud. */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 60;

/** Nombre limpio: sin espacios repetidos ni en los extremos. */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

const RULE = '━━━━━━━━━━━━━━━';

/**
 * Mensaje con el formato propio de WhatsApp (*negrita*, _cursiva_, listas con
 * "- "). Sin emojis fuera del plano básico de Unicode: el enlace wa.me los
 * convierte en "�" en algunas versiones (WhatsApp Desktop/Web).
 */
export function buildRequestMessage(
  selection: RequestSelection,
  quote: Quote | null,
  roomLabel: RoomLabel,
  hotelName = 'Rancho Porvenir',
): string {
  const name = cleanName(selection.name);
  const totals = computeTotals(selection, quote);
  const lines: string[] = [
    `*${hotelName.toUpperCase()}*`,
    '_Consulta de disponibilidad_',
    RULE,
    '',
    name ? `Hola, soy *${name}*. Me gustaría consultar este plan:` : 'Hola, me gustaría consultar este plan:',
  ];

  if (selection.room) {
    const jacuzzi = selection.room.hasJacuzzi ? ' _(con jacuzzi)_' : '';
    lines.push('', `*▸ ${singularLabel(roomLabel)}*`, `${selection.room.name}${jacuzzi}`);
    if (selection.checkIn && selection.checkOut) {
      lines.push(`Entrada: ${formatDate(selection.checkIn)}`, `Salida: ${formatDate(selection.checkOut)}`);
    }
    const stay = [
      quote?.nightsCount ? pluralize(quote.nightsCount, 'noche', 'noches') : null,
      pluralize(selection.guests, 'persona', 'personas'),
    ].filter(Boolean);
    lines.push(stay.join(' · '));
    if (quote && totals.room > 0) lines.push(`Subtotal: ${formatMoney(totals.room)}`);
  } else {
    lines.push('', `*▸ Personas:* ${selection.guests}`);
  }

  if (selection.horseback.length > 0) {
    lines.push('', '*▸ Cabalgatas*');
    for (const ride of selection.horseback) {
      const price =
        ride.pricePerPerson === null
          ? '_precio por confirmar_'
          : formatMoney(ride.pricePerPerson * ride.people);
      lines.push(`- ${ride.name} × ${pluralize(ride.people, 'persona', 'personas')} — ${price}`);
    }
  }

  if (selection.products.length > 0) {
    lines.push('', '*▸ Productos*');
    for (const product of selection.products) {
      lines.push(`- ${product.name} × ${product.quantity} — ${formatMoney(product.price * product.quantity)}`);
    }
  }

  if (totals.total > 0) {
    lines.push(
      '',
      RULE,
      `*Total estimado: ${formatMoney(totals.total)} COP*`,
      totals.hasUnpricedItems
        ? '_Sujeto a confirmación del hotel. No incluye lo que tiene precio por confirmar._'
        : '_Sujeto a confirmación del hotel._',
    );
  }

  lines.push('', '¡Gracias! Quedo atento(a) a su respuesta.');
  return lines.join('\n');
}

/** Solo dígitos: wa.me no acepta "+", espacios ni guiones. */
export function whatsappUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
