import { z } from 'zod';

/**
 * Validación de los formularios del panel (CONTEXT §2: zod en el frontend).
 * Los formularios guardan strings; estos esquemas los convierten al cuerpo que
 * espera la API. El backend vuelve a validar todo.
 */

/** Máximo de caracteres de las descripciones (igual que el backend). */
export const DESCRIPTION_MAX = 200;

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} es obligatorio`).max(max, `${label}: máximo ${max} caracteres`);

/** "280.000", "$ 280000" → 280000. Texto no numérico → NaN (z.number lo rechaza). */
const toNumber = (value: string): number => Number(value.replace(/[.\s$%]/g, '').replace(',', '.'));

const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .transform(toNumber)
    .pipe(
      z
        .number({ message: `${label} debe ser un número` })
        .int(`${label} debe ser un valor entero en pesos`)
        .min(0, `${label} no puede ser negativo`)
        .max(50_000_000, `${label} es demasiado alto`),
    );

const optionalInt = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : toNumber(v)))
    .pipe(
      z
        .number({ message: `${label} debe ser un número` })
        .int(`${label} debe ser entero`)
        .min(min, `${label}: mínimo ${min}`)
        .max(max, `${label}: máximo ${max}`)
        .nullable(),
    );

const optionalMoney = (label: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : toNumber(v)))
    .pipe(
      z
        .number({ message: `${label} debe ser un número` })
        .int(`${label} debe ser un valor entero en pesos`)
        .min(0, `${label} no puede ser negativo`)
        .nullable(),
    );

export const roomSchema = z.object({
  name: requiredText('El nombre', 120),
  description: requiredText('La descripción', DESCRIPTION_MAX),
  hasJacuzzi: z.boolean(),
  capacity: optionalInt('La capacidad', 1, 50),
  weekdayPrice: money('El precio entre semana'),
  weekendPrice: money('El precio de fin de semana'),
  amenities: z.array(z.string().trim().min(1).max(60)).max(30, 'Máximo 30 etiquetas'),
  productIds: z.array(z.string()).max(20, 'Máximo 20 productos'),
});
export type RoomFormValues = z.input<typeof roomSchema>;

export const horsebackSchema = z.object({
  name: requiredText('El nombre', 120),
  description: requiredText('La descripción', DESCRIPTION_MAX),
  durationMinutes: z
    .string()
    .trim()
    .min(1, 'La duración es obligatoria')
    .transform(toNumber)
    .pipe(
      z
        .number({ message: 'La duración debe ser un número' })
        .int('La duración debe ser en minutos enteros')
        .min(10, 'Mínimo 10 minutos')
        .max(1440, 'Máximo 24 horas'),
    ),
  pricePerPerson: optionalMoney('El precio por persona'),
  schedule: z.string().trim().max(1000, 'Máximo 1000 caracteres'),
});
export type HorsebackFormValues = z.input<typeof horsebackSchema>;

export const productSchema = z.object({
  name: requiredText('El nombre', 120),
  description: requiredText('La descripción', DESCRIPTION_MAX),
  price: money('El precio'),
});
export type ProductFormValues = z.input<typeof productSchema>;

const isoDate = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} no es una fecha válida`);

export const priceRuleSchema = z
  .object({
    name: requiredText('El nombre', 120),
    startDate: isoDate('La primera noche'),
    endDate: isoDate('La última noche'),
    roomId: z.string().transform((v) => (v === '' ? null : v)),
    type: z.enum(['FIXED', 'PERCENT']),
    value: z
      .string()
      .trim()
      .min(1, 'El valor es obligatorio')
      .transform(toNumber)
      .pipe(z.number({ message: 'El valor debe ser un número' }).int('El valor debe ser entero')),
    priority: z
      .string()
      .trim()
      .transform((v) => (v === '' ? 0 : toNumber(v)))
      .pipe(
        z
          .number({ message: 'La prioridad debe ser un número' })
          .int('La prioridad debe ser entera')
          .min(0, 'Mínimo 0')
          .max(1000, 'Máximo 1000'),
      ),
    isActive: z.boolean(),
  })
  .superRefine((rule, ctx) => {
    if (rule.endDate < rule.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Debe ser igual o posterior a la primera noche' });
    }
    if (rule.type === 'FIXED' && rule.value <= 0) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'El precio fijo debe ser mayor que 0' });
    }
    if (rule.type === 'PERCENT' && (rule.value < -90 || rule.value > 300)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'El ajuste debe estar entre -90 % y 300 %' });
    }
  });
export type PriceRuleFormValues = z.input<typeof priceRuleSchema>;

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'Debe ser un enlace que empiece por https://');

/** Lista editada como texto (una por línea): sin líneas vacías, máx. 20 de 400 caracteres. */
const lineList = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean))
  .refine((items) => items.length <= 20, 'Máximo 20 líneas')
  .refine((items) => items.every((item) => item.length <= 400), 'Cada línea admite máximo 400 caracteres');

export const settingsSchema = z.object({
  hotelName: requiredText('El nombre del hotel', 120),
  roomLabel: z.enum(['Cabañas', 'Habitaciones']),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v === '' || /^\d{10,15}$/.test(v), 'Escribe el número con indicativo, ej. 573001234567'),
  whatsappGreeting: z.string().trim().max(500, 'Máximo 500 caracteres'),
  fridayNightIsWeekend: z.boolean(),
  address: z.string().trim().max(250, 'Máximo 250 caracteres'),
  city: z.string().trim().max(120, 'Máximo 120 caracteres'),
  mapsUrl: optionalUrl,
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Correo no válido'),
  phone: z.string().trim().max(30, 'Máximo 30 caracteres'),
  socials: z.object({ instagram: optionalUrl, facebook: optionalUrl, tiktok: optionalUrl }),
  checkInTime: z.string().trim().max(40, 'Máximo 40 caracteres'),
  checkOutTime: z.string().trim().max(40, 'Máximo 40 caracteres'),
  sharedAreas: z.string().trim().max(250, 'Máximo 250 caracteres'),
  petsPolicy: z.string().trim().max(500, 'Máximo 500 caracteres'),
  recommendations: lineList,
  houseRules: lineList,
  bookingTerms: lineList,
});
export type SettingsFormValues = z.input<typeof settingsSchema>;

/** Errores de zod como { campo: mensaje } (rutas anidadas con punto: "socials.instagram"). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
