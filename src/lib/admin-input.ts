/**
 * "Pipes" de los campos del panel: transforman lo que se escribe mientras se
 * escribe. Funciones puras (con tests).
 */

/** Sin espacios dobles (los saltos de línea de los textos largos se respetan). */
export function collapseSpaces(value: string): string {
  return value.replace(/[^\S\n]{2,}/g, ' ');
}

/** Solo dígitos con punto de miles: "300000" → "300.000", "$ 1.5a00" → "1.500". */
export function formatCopInput(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 9);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export type Period = 'am' | 'pm';
export interface TimeParts {
  /** 1–12 */
  hour: number;
  /** 0–59 */
  minute: number;
  period: Period;
}

/**
 * Hora como se escribe en Colombia: "3:00 p. m.", "9:30 a. m.", y el mediodía
 * "12:00 m.".
 */
export function formatTime({ hour, minute, period }: TimeParts): string {
  const mm = String(minute).padStart(2, '0');
  if (hour === 12 && minute === 0 && period === 'pm') return '12:00 m.';
  return `${hour}:${mm} ${period === 'am' ? 'a. m.' : 'p. m.'}`;
}

/** Lee lo que ya esté guardado ("3:00 p. m.", "12:00 m.", "15:00", "3pm"); null si no se entiende. */
export function parseTime(value: string): TimeParts | null {
  const text = value.toLowerCase().replace(/\s+/g, '');
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?(a\.?m\.?|p\.?m\.?|m\.?)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  if (minute > 59) return null;
  const suffix = match[3]?.replace(/\./g, '');
  if (!suffix) {
    // Formato 24 h.
    if (hour > 23) return null;
    const period: Period = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12;
    return { hour, minute, period };
  }
  if (hour < 1 || hour > 12) return null;
  if (suffix === 'm') return hour === 12 ? { hour: 12, minute, period: 'pm' } : null;
  return { hour, minute, period: suffix === 'am' ? 'am' : 'pm' };
}
