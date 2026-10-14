'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { DESCRIPTION_MAX, fieldErrors, horsebackSchema, type HorsebackFormValues } from '@/lib/admin-schemas';
import type { AdminHorseback } from '@/lib/types';
import { useToast } from './toast';
import { formatCopInput } from '@/lib/admin-input';
import { adminButton, CharCount, Field, FormError, inputClass, invalidProps, MoneyInput, Panel } from './ui';
import { useFormState } from './use-form-state';

function initialValues(ride?: AdminHorseback): HorsebackFormValues {
  return {
    name: ride?.name ?? '',
    description: ride?.description ?? '',
    durationMinutes: ride?.durationMinutes.toString() ?? '',
    pricePerPerson: ride?.pricePerPerson != null ? formatCopInput(String(ride.pricePerPerson)) : '',
    schedule: ride?.schedule ?? '',
  };
}

export function HorsebackForm({
  ride,
  onSaved,
}: {
  ride?: AdminHorseback;
  onSaved: (ride: AdminHorseback) => void;
}) {
  const toast = useToast();
  const { values, set, dirty, markSaved } = useFormState<HorsebackFormValues>(() => initialValues(ride));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty) return;
    const parsed = horsebackSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setServerError(null);
    setSaving(true);
    try {
      const body = { ...parsed.data, schedule: parsed.data.schedule || null };
      const saved = await adminFetch<AdminHorseback>(ride ? `horseback/${ride.id}` : 'horseback', {
        method: ride ? 'PATCH' : 'POST',
        body,
      });
      toast('success', ride ? 'Cambios guardados' : 'Cabalgata creada. Ahora sube al menos una foto.');
      markSaved();
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
        <Field label="Nombre" htmlFor="hb-name" error={errors.name}>
          <input
            id="hb-name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
            maxLength={120}
            {...invalidProps('hb-name', errors.name)}
          />
        </Field>
        <Field label="Descripción" htmlFor="hb-description" error={errors.description}>
          <textarea
            id="hb-description"
            rows={4}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
            {...invalidProps('hb-description', errors.description)}
          />
          <CharCount value={values.description} max={DESCRIPTION_MAX} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duración (minutos)" htmlFor="hb-duration" error={errors.durationMinutes}>
            <input
              id="hb-duration"
              inputMode="numeric"
              value={values.durationMinutes}
              onChange={(e) => set('durationMinutes', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className={inputClass}
              placeholder="90"
              {...invalidProps('hb-duration', errors.durationMinutes)}
            />
          </Field>
          <Field
            label="Precio por persona (COP)"
            htmlFor="hb-price"
            error={errors.pricePerPerson}
            hint="Déjalo vacío para mostrar «Consultar precio»."
          >
            <MoneyInput
              id="hb-price"
              value={values.pricePerPerson}
              onChange={(v) => set('pricePerPerson', v)}
              placeholder="35.000"
              invalid={invalidProps('hb-price', errors.pricePerPerson)}
            />
          </Field>
        </div>
        <Field label="Horarios o notas" htmlFor="hb-schedule" error={errors.schedule} hint="Ej.: Todos los días a las 4:30 p. m. Sujeta al clima.">
          <textarea
            id="hb-schedule"
            rows={2}
            value={values.schedule}
            onChange={(e) => set('schedule', e.target.value)}
            className={inputClass}
            {...invalidProps('hb-schedule', errors.schedule)}
          />
        </Field>
        <button type="submit" disabled={saving || !dirty} className={`${adminButton.primary} w-full sm:w-auto`}>
          {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
          {ride ? 'Guardar cambios' : 'Crear cabalgata'}
        </button>
      </form>
    </Panel>
  );
}
