import { describe, expect, it } from 'vitest';
import { fieldErrors, priceRuleSchema, roomSchema, settingsSchema } from './admin-schemas';

describe('roomSchema', () => {
  it('convierte precios con puntos de miles y capacidad vacía a null', () => {
    const parsed = roomSchema.parse({
      name: ' Cabaña del Roble ',
      description: 'Linda',
      hasJacuzzi: true,
      capacity: '',
      weekdayPrice: '280.000',
      weekendPrice: '$350.000',
    });
    expect(parsed).toEqual({
      name: 'Cabaña del Roble',
      description: 'Linda',
      hasJacuzzi: true,
      capacity: null,
      weekdayPrice: 280000,
      weekendPrice: 350000,
    });
  });

  it('marca los campos obligatorios', () => {
    const result = roomSchema.safeParse({
      name: '',
      description: '',
      hasJacuzzi: false,
      capacity: '0',
      weekdayPrice: '',
      weekendPrice: 'abc',
    });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(
      ['capacity', 'description', 'name', 'weekdayPrice', 'weekendPrice'].sort(),
    );
  });
});

describe('priceRuleSchema', () => {
  const base = {
    name: 'Puente festivo',
    startDate: '2026-11-01',
    endDate: '2026-11-01',
    roomId: '',
    type: 'PERCENT' as const,
    value: '15',
    priority: '',
    isActive: true,
  };

  it('regla para todas las habitaciones con prioridad por defecto', () => {
    expect(priceRuleSchema.parse(base)).toMatchObject({ roomId: null, value: 15, priority: 0 });
  });

  it('valida el orden de fechas y los rangos del valor', () => {
    const errors = fieldErrors(
      priceRuleSchema.safeParse({ ...base, endDate: '2026-10-30', value: '500' }).error!,
    );
    expect(errors.endDate).toBeDefined();
    expect(errors.value).toContain('-90 %');
    expect(priceRuleSchema.safeParse({ ...base, type: 'FIXED', value: '0' }).success).toBe(false);
  });
});

describe('settingsSchema', () => {
  it('limpia el número de WhatsApp y exige https en los enlaces', () => {
    const result = settingsSchema.safeParse({
      hotelName: 'Rancho Porvenir',
      roomLabel: 'Cabañas',
      whatsappNumber: '+57 300 123 4567',
      whatsappGreeting: 'Hola',
      fridayNightIsWeekend: false,
      address: '',
      city: '',
      mapsUrl: 'maps.google.com',
      email: '',
      phone: '',
      socials: { instagram: '', facebook: '', tiktok: '' },
    });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!)).toEqual({ mapsUrl: expect.stringContaining('https://') });
  });
});
