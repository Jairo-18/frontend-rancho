import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

const items = Array.from({ length: 23 }, (_, i) => i + 1);

describe('paginate', () => {
  it('de 10 en 10, la última con lo que sobra', () => {
    expect(paginate(items, undefined)).toMatchObject({ page: 1, totalPages: 3, items: items.slice(0, 10) });
    expect(paginate(items, '3').items).toEqual([21, 22, 23]);
  });

  it('páginas inválidas o fuera de rango quedan dentro del rango', () => {
    expect(paginate(items, 'abc').page).toBe(1);
    expect(paginate(items, '0').page).toBe(1);
    expect(paginate(items, '99').page).toBe(3);
    expect(paginate([], '2')).toMatchObject({ page: 1, totalPages: 1, items: [] });
  });
});
