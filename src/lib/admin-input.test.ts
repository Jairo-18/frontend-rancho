import { describe, expect, it } from 'vitest';
import { collapseSpaces, formatCopInput, formatTime, parseTime } from './admin-input';

describe('collapseSpaces', () => {
  it('quita espacios dobles y conserva los saltos de línea', () => {
    expect(collapseSpaces('Cabaña   Mirador')).toBe('Cabaña Mirador');
    expect(collapseSpaces('Línea 1\n\nLínea  2')).toBe('Línea 1\n\nLínea 2');
    expect(collapseSpaces('fin ')).toBe('fin ');
  });
});

describe('formatCopInput', () => {
  it('pone punto de miles e ignora lo que no es número', () => {
    expect(formatCopInput('300000')).toBe('300.000');
    expect(formatCopInput('$ 1.250.000')).toBe('1.250.000');
    expect(formatCopInput('00028000')).toBe('28.000');
    expect(formatCopInput('abc')).toBe('');
    expect(formatCopInput('0')).toBe('0');
  });
});

describe('formatTime / parseTime', () => {
  it('escribe la hora como en Colombia, con el mediodía como "m."', () => {
    expect(formatTime({ hour: 3, minute: 0, period: 'pm' })).toBe('3:00 p. m.');
    expect(formatTime({ hour: 9, minute: 30, period: 'am' })).toBe('9:30 a. m.');
    expect(formatTime({ hour: 12, minute: 0, period: 'pm' })).toBe('12:00 m.');
  });

  it('entiende lo que ya está guardado', () => {
    expect(parseTime('3:00 p. m.')).toEqual({ hour: 3, minute: 0, period: 'pm' });
    expect(parseTime('12:00 m.')).toEqual({ hour: 12, minute: 0, period: 'pm' });
    expect(parseTime('15:30')).toEqual({ hour: 3, minute: 30, period: 'pm' });
    expect(parseTime('12000.')).toBeNull();
    expect(parseTime('')).toBeNull();
  });
});
