import { describe, expect, it } from 'vitest';
import { isDisabled, isWeekendNight, monthGrid, pickDate, shiftMonth } from './calendar';

describe('monthGrid', () => {
  it('octubre 2026 empieza en jueves: tres huecos antes del 1 (semana de lunes a domingo)', () => {
    const grid = monthGrid({ year: 2026, month: 10 });
    expect(grid.slice(0, 4)).toEqual([null, null, null, '2026-10-01']);
    expect(grid.filter(Boolean)).toHaveLength(31);
    expect(grid.length % 7).toBe(0);
  });

  it('febrero de año bisiesto tiene 29 días', () => {
    expect(monthGrid({ year: 2028, month: 2 }).filter(Boolean)).toHaveLength(29);
  });
});

describe('shiftMonth', () => {
  it('cruza el cambio de año en ambos sentidos', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 });
  });
});

describe('isWeekendNight', () => {
  it('sábado y domingo siempre; viernes solo si el ajuste lo dice', () => {
    expect(isWeekendNight('2026-10-17', false)).toBe(true); // sábado
    expect(isWeekendNight('2026-10-18', false)).toBe(true); // domingo
    expect(isWeekendNight('2026-10-16', false)).toBe(false); // viernes
    expect(isWeekendNight('2026-10-16', true)).toBe(true);
    expect(isWeekendNight('2026-10-15', true)).toBe(false); // jueves
  });
});

describe('pickDate', () => {
  it('primero la llegada, luego la salida, y termina', () => {
    const a = pickDate({ checkIn: '', checkOut: '', active: 'checkIn' }, '2026-10-15');
    expect(a).toEqual({ checkIn: '2026-10-15', checkOut: '', active: 'checkOut', done: false });
    const b = pickDate(a, '2026-10-17');
    expect(b).toMatchObject({ checkIn: '2026-10-15', checkOut: '2026-10-17', done: true });
  });

  it('un día anterior o igual a la llegada la reemplaza', () => {
    const next = pickDate({ checkIn: '2026-10-15', checkOut: '', active: 'checkOut' }, '2026-10-12');
    expect(next).toMatchObject({ checkIn: '2026-10-12', active: 'checkOut', done: false });
  });

  it('cambiar la llegada conserva la salida solo si sigue siendo válida', () => {
    const state = { checkIn: '2026-10-15', checkOut: '2026-10-17', active: 'checkIn' as const };
    expect(pickDate(state, '2026-10-16').checkOut).toBe('2026-10-17');
    expect(pickDate(state, '2026-10-20').checkOut).toBe('');
  });
});

describe('isDisabled', () => {
  const today = '2026-10-14';
  it('bloquea el pasado y salidas de más de 30 noches', () => {
    const state = { checkIn: '2026-10-15', checkOut: '', active: 'checkOut' as const };
    expect(isDisabled('2026-10-13', state, today)).toBe(true);
    expect(isDisabled('2026-11-14', state, today)).toBe(false); // 30 noches
    expect(isDisabled('2026-11-15', state, today)).toBe(true); // 31 noches
  });
});
