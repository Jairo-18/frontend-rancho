import type { NightType, RoomLabel } from './types';

const numberFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** 350000 → "$350.000" (COP, sin decimales). */
export function formatMoney(value: number): string {
  return `$${numberFormat.format(value)}`;
}

const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Fechas de calendario `YYYY-MM-DD`. Se formatean a mano (no con `new Date()` en
 * la zona del navegador) para que el día nunca se corra por zona horaria.
 */
function parts(date: string): { y: number; m: number; d: number; dow: number } {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "2026-10-24" → "sáb 24 oct 2026" */
export function formatDate(date: string): string {
  const { y, m, d, dow } = parts(date);
  return `${WEEKDAYS_SHORT[dow]} ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** "2026-10-24" → "sábado" */
export function weekdayName(date: string): string {
  return WEEKDAYS_LONG[parts(date).dow];
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** 90 → "1 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const NIGHT_TYPE_LABEL: Record<NightType, string> = {
  WEEKDAY: 'Entre semana',
  WEEKEND: 'Fin de semana',
  SPECIAL: 'Tarifa especial',
};

/** "Cabañas" → "Cabaña" · "Habitaciones" → "Habitación" */
export function singularLabel(label: RoomLabel): string {
  return label === 'Habitaciones' ? 'Habitación' : 'Cabaña';
}

/** Fecha de hoy en Colombia (YYYY-MM-DD), para el mínimo de los selectores de fecha. */
export function todayInBogota(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(date: string, days: number): string {
  const { y, m, d } = parts(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parts(checkIn);
  const b = parts(checkOut);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}
