import { describe, expect, it } from 'vitest';
import { applyAdjustments, fitScale, NO_ADJUSTMENTS, rotatedSize } from './image-edit';

describe('rotatedSize', () => {
  it('a 90° se intercambian ancho y alto; a 0° no cambia', () => {
    expect(rotatedSize(400, 300, 0)).toEqual({ width: 400, height: 300 });
    const r = rotatedSize(400, 300, 90);
    expect(Math.round(r.width)).toBe(300);
    expect(Math.round(r.height)).toBe(400);
  });
});

describe('fitScale', () => {
  it('reduce solo si el lado mayor pasa del máximo', () => {
    expect(fitScale(1000, 800)).toBe(1);
    expect(fitScale(4800, 3600)).toBe(0.5);
  });
});

describe('applyAdjustments', () => {
  const pixel = () => new Uint8ClampedArray([200, 100, 50, 255]);

  it('sin ajustes no toca nada', () => {
    const data = pixel();
    applyAdjustments(data, NO_ADJUSTMENTS);
    expect([...data]).toEqual([200, 100, 50, 255]);
  });

  it('más brillo aclara y menos oscurece; el alfa no cambia', () => {
    const lighter = pixel();
    applyAdjustments(lighter, { brightness: 40, contrast: 0, saturation: 0 });
    expect(lighter[0]).toBeGreaterThan(200);
    expect(lighter[3]).toBe(255);
    const darker = pixel();
    applyAdjustments(darker, { brightness: -40, contrast: 0, saturation: 0 });
    expect(darker[0]).toBeLessThan(200);
  });

  it('saturación -100 deja la foto en grises', () => {
    const data = pixel();
    applyAdjustments(data, { brightness: 0, contrast: 0, saturation: -100 });
    expect(data[0]).toBe(data[1]);
    expect(data[1]).toBe(data[2]);
  });
});
