'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { fieldErrors, roomSchema, type RoomFormValues } from '@/lib/admin-schemas';
import type { AdminRoom } from '@/lib/types';
import { useAdmin } from './admin-shell';
import { useToast } from './toast';
import { adminButton, Field, FormError, inputClass, invalidProps, Panel, Toggle } from './ui';

function initialValues(room?: AdminRoom): RoomFormValues {
  return {
    name: room?.name ?? '',
    description: room?.description ?? '',
    hasJacuzzi: room?.hasJacuzzi ?? false,
    capacity: room?.capacity?.toString() ?? '',
    weekdayPrice: room?.weekdayPrice.toString() ?? '',
    weekendPrice: room?.weekendPrice.toString() ?? '',
  };
}

/** Datos de la cabaña. Crear: POST; editar: PATCH. Devuelve la cabaña guardada. */
export function RoomForm({ room, onSaved }: { room?: AdminRoom; onSaved: (room: AdminRoom) => void }) {
  const { roomSingular } = useAdmin();
  const toast = useToast();
  const [values, setValues] = useState<RoomFormValues>(() => initialValues(room));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RoomFormValues>(key: K, value: RoomFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = roomSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setServerError(null);
    setSaving(true);
    try {
      const saved = await adminFetch<AdminRoom>(room ? `rooms/${room.id}` : 'rooms', {
        method: room ? 'PATCH' : 'POST',
        body: parsed.data,
      });
      toast('success', room ? 'Cambios guardados' : `${roomSingular} creada. Ahora sube las fotos.`);
      onSaved(saved);
    } catch (error) {
      setServerError(
        error instanceof AdminApiError
          ? { message: error.message, details: error.details }
          : { message: 'No se pudo guardar.', details: [] },
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <h2 className="text-xl">Datos</h2>
        <FormError message={serverError?.message ?? null} details={serverError?.details} />
        <Field label="Nombre" htmlFor="room-name" error={errors.name}>
          <input
            id="room-name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
            maxLength={120}
            {...invalidProps('room-name', errors.name)}
          />
        </Field>
        <Field label="Descripción" htmlFor="room-description" error={errors.description} hint="Separa párrafos con una línea en blanco.">
          <textarea
            id="room-description"
            rows={5}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
            {...invalidProps('room-description', errors.description)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio entre semana (COP por noche)" htmlFor="room-weekday" error={errors.weekdayPrice} hint="Lunes a viernes">
            <input
              id="room-weekday"
              inputMode="numeric"
              value={values.weekdayPrice}
              onChange={(e) => set('weekdayPrice', e.target.value)}
              className={inputClass}
              placeholder="280000"
              {...invalidProps('room-weekday', errors.weekdayPrice)}
            />
          </Field>
          <Field label="Precio fin de semana (COP por noche)" htmlFor="room-weekend" error={errors.weekendPrice} hint="Sábado y domingo">
            <input
              id="room-weekend"
              inputMode="numeric"
              value={values.weekendPrice}
              onChange={(e) => set('weekendPrice', e.target.value)}
              className={inputClass}
              placeholder="350000"
              {...invalidProps('room-weekend', errors.weekendPrice)}
            />
          </Field>
        </div>
        <Field label="Capacidad (personas)" htmlFor="room-capacity" error={errors.capacity} hint="Opcional">
          <input
            id="room-capacity"
            inputMode="numeric"
            value={values.capacity}
            onChange={(e) => set('capacity', e.target.value)}
            className={`${inputClass} sm:max-w-40`}
            {...invalidProps('room-capacity', errors.capacity)}
          />
        </Field>
        <Toggle
          id="room-jacuzzi"
          checked={values.hasJacuzzi}
          onChange={(v) => set('hasJacuzzi', v)}
          label="Tiene jacuzzi"
          description="Se muestra como insignia destacada en el sitio."
        />
        <button type="submit" disabled={saving} className={`${adminButton.primary} w-full sm:w-auto`}>
          {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
          {room ? 'Guardar cambios' : `Crear ${roomSingular.toLowerCase()}`}
        </button>
      </form>
    </Panel>
  );
}
