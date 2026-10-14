import { addDays, nightsBetween } from './format';

/**
 * Lógica pura del selector de fechas (fechas de calendario `YYYY-MM-DD`, sin
 * zona horaria). El componente solo pinta lo que esto decide.
 */

export const MAX_NIGHTS = 30;

export const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
/** Encabezado de la grilla: la semana empieza el lunes, como en Colombia. */
export const WEEK_HEADER = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

export interface MonthRef {
  year: number;
  /** 1–12 */
  month: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function monthOf(date: string): MonthRef {
  return { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) };
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function compareMonths(a: MonthRef, b: MonthRef): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

/** 0 = domingo … 6 = sábado. */
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * Celdas del mes en semanas de lunes a domingo: `null` para los huecos antes
 * del día 1 y después del último.
 */
export function monthGrid({ year, month }: MonthRef): (string | null)[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = (dayOfWeek(toIso(year, month, 1)) + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(toIso(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** La noche que empieza ese día se cobra como fin de semana (CONTEXT §3.2). */
export function isWeekendNight(date: string, fridayNightIsWeekend: boolean): boolean {
  const dow = dayOfWeek(date);
  return dow === 6 || dow === 0 || (fridayNightIsWeekend && dow === 5);
}

export type ActiveField = 'checkIn' | 'checkOut';

export interface RangeState {
  checkIn: string;
  checkOut: string;
  active: ActiveField;
}

/** ¿Se puede tocar ese día? (pasado o más de 30 noches después de la llegada: no) */
export function isDisabled(date: string, state: RangeState, today: string): boolean {
  if (date < today) return true;
  if (state.active === 'checkOut' && state.checkIn && date > state.checkIn) {
    return nightsBetween(state.checkIn, date) > MAX_NIGHTS;
  }
  return false;
}

/**
 * Qué pasa al tocar un día. Eligiendo la llegada (o un día anterior a ella) se
 * pone la llegada y se pasa a elegir la salida; la salida se conserva solo si
 * sigue siendo válida. Eligiendo la salida se termina (`done`).
 */
export function pickDate(state: RangeState, date: string): RangeState & { done: boolean } {
  if (state.active === 'checkIn' || !state.checkIn || date <= state.checkIn) {
    const keepOut =
      state.checkOut > date && nightsBetween(date, state.checkOut) <= MAX_NIGHTS && state.active === 'checkIn';
    return { checkIn: date, checkOut: keepOut ? state.checkOut : '', active: 'checkOut', done: false };
  }
  return { ...state, checkOut: date, done: true };
}

/** Primer día que se puede elegir como salida. */
export function firstCheckOut(checkIn: string): string {
  return addDays(checkIn, 1);
}
