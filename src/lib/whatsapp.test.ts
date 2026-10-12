import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney } from './format';
import type { Quote } from './types';
import {
  buildRequestMessage,
  computeTotals,
  isSelectionEmpty,
  type RequestSelection,
  whatsappUrl,
} from './whatsapp';

const quote: Quote = {
  roomId: 'room-1',
  roomName: 'Cabaña del Roble',
  checkIn: '2026-10-24',
  checkOut: '2026-10-26',
  nightsCount: 2,
  currency: 'COP',
  fridayNightIsWeekend: false,
  nights: [
    { date: '2026-10-24', dayOfWeek: 6, type: 'WEEKEND', basePrice: 350000, price: 350000, rule: null },
    { date: '2026-10-25', dayOfWeek: 0, type: 'WEEKEND', basePrice: 350000, price: 350000, rule: null },
  ],
  total: 700000,
};

const selection: RequestSelection = {
  room: { id: 'room-1', slug: 'cabana-del-roble', name: 'Cabaña del Roble', hasJacuzzi: true },
  checkIn: '2026-10-24',
  checkOut: '2026-10-26',
  guests: 2,
  horseback: [{ id: 'h1', name: 'Cabalgata al atardecer', pricePerPerson: null, people: 2 }],
  products: [{ id: 'p1', name: 'Miel de abeja', price: 28000, quantity: 1 }],
};

describe('formato', () => {
  it('fechas como "sáb 24 oct 2026" sin depender de la zona horaria', () => {
    expect(formatDate('2026-10-24')).toBe('sáb 24 oct 2026');
    expect(formatDate('2026-10-26')).toBe('lun 26 oct 2026');
  });

  it('pesos colombianos con punto de miles', () => {
    expect(formatMoney(350000)).toBe('$350.000');
    expect(formatMoney(1592500)).toBe('$1.592.500');
  });
});

describe('buildRequestMessage', () => {
  it('arma el mensaje del ejemplo de CONTEXT §3.5', () => {
    expect(buildRequestMessage(selection, quote, 'Cabañas')).toBe(
      [
        'Hola, quiero consultar disponibilidad:',
        '🏡 Cabaña: Cabaña del Roble (con jacuzzi)',
        '📅 Entrada: sáb 24 oct 2026 · Salida: lun 26 oct 2026 (2 noches)',
        '👥 Personas: 2',
        '🐎 Cabalgata: Cabalgata al atardecer x2 personas (precio por confirmar)',
        '🛍️ Productos: Miel de abeja x1',
        '💰 Total estimado: $728.000 COP',
        '(sujeto a confirmación por el hotel; no incluye lo que tiene precio por confirmar)',
        '¡Gracias!',
      ].join('\n'),
    );
  });

  it('cabalgata con precio suma al total; respeta el rótulo "Habitación"', () => {
    const priced: RequestSelection = {
      ...selection,
      room: { ...selection.room!, hasJacuzzi: false },
      horseback: [{ id: 'h2', name: 'Ruta de la quebrada', pricePerPerson: 70000, people: 3 }],
      products: [],
    };
    const message = buildRequestMessage(priced, quote, 'Habitaciones');
    expect(message).toContain('🏡 Habitación: Cabaña del Roble\n');
    expect(message).toContain('🐎 Cabalgata: Ruta de la quebrada x3 personas · $210.000');
    expect(message).toContain('💰 Total estimado: $910.000 COP\n(sujeto a confirmación por el hotel)\n');
    expect(message).not.toContain('Productos');
  });

  it('una noche en singular y sin total cuando no hay nada con precio', () => {
    const oneNight = { ...quote, nightsCount: 1, total: 0 };
    const message = buildRequestMessage(
      { ...selection, checkOut: '2026-10-25', horseback: [], products: [] },
      oneNight,
      'Cabañas',
    );
    expect(message).toContain('(1 noche)');
    expect(message).not.toContain('Total');
  });
});

describe('computeTotals', () => {
  it('no suma cabalgatas sin precio y lo indica', () => {
    expect(computeTotals(selection, quote)).toEqual({
      room: 700000,
      horseback: 0,
      products: 28000,
      total: 728000,
      hasUnpricedItems: true,
    });
  });
});

describe('isSelectionEmpty', () => {
  it('vacía solo si no hay cabaña, cabalgatas ni productos', () => {
    const empty: RequestSelection = {
      room: null,
      checkIn: null,
      checkOut: null,
      guests: 2,
      horseback: [],
      products: [],
    };
    expect(isSelectionEmpty(empty)).toBe(true);
    expect(isSelectionEmpty({ ...empty, products: selection.products })).toBe(false);
  });
});

describe('whatsappUrl', () => {
  it('limpia el número y codifica el texto (emojis, saltos de línea, tildes)', () => {
    const url = whatsappUrl('+57 300 123-4567', 'Hola 🐎\n¿Hay cupo?');
    expect(url).toBe(
      'https://wa.me/573001234567?text=Hola%20%F0%9F%90%8E%0A%C2%BFHay%20cupo%3F',
    );
    expect(decodeURIComponent(new URL(url).searchParams.get('text') ?? '')).toBe(
      'Hola 🐎\n¿Hay cupo?',
    );
  });
});
