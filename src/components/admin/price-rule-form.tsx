'use client';

import { LoaderCircle, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { fieldErrors, priceRuleSchema, type PriceRuleFormValues } from '@/lib/admin-schemas';
import { addDays, formatMoney, todayInBogota } from '@/lib/format';
import type { AdminRoom, PriceRule } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { formatCopInput } from '@/lib/admin-input';
import { useAdmin } from './admin-shell';
import { useConfirm } from './confirm-dialog';
import { useToast } from './toast';
import { adminButton, Field, FormError, inputClass, invalidProps, MoneyInput, Panel, Toggle } from './ui';
import { useFormState } from './use-form-state';

function initialValues(rule?: PriceRule): PriceRuleFormValues {
  const today = todayInBogota();
  return {
    name: rule?.name ?? '',
    startDate: rule?.startDate ?? today,
    endDate: rule?.endDate ?? addDays(today, 1),
    roomId: rule?.roomId ?? '',
    type: rule?.type ?? 'PERCENT',
    value: rule ? (rule.type === 'FIXED' ? formatCopInput(String(rule.value)) : rule.value.toString()) : '',
    priority: rule?.priority.toString() ?? '10',
    isActive: rule?.isActive ?? true,
  };
}

/** Vista previa en palabras de cómo queda el precio con la regla. */
function describe(values: PriceRuleFormValues): string | null {
  const value = Number(values.value.replace(/[.\s$%]/g, ''));
  if (!values.value || Number.isNaN(value)) return null;
  if (values.type === 'FIXED') return `Cada noche del rango cuesta ${formatMoney(value)}.`;
  if (value === 0) return 'No cambia el precio.';
  return `El precio de cada noche (entre semana o fin de semana) ${value > 0 ? 'sube' : 'baja'} un ${Math.abs(value)} %.`;
}

export function PriceRuleForm({
  rule,
  onSaved,
  onDeleted,
}: {
  rule?: PriceRule;
  onSaved: (rule: PriceRule) => void;
  onDeleted?: () => void;
}) {
  const { roomLabel } = useAdmin();
  const toast = useToast();
  const rooms = useAdminData<AdminRoom[]>('rooms/admin?status=all');
  const { values, set, setValues, dirty, markSaved } = useFormState<PriceRuleFormValues>(() => initialValues(rule));
  const { confirm, dialog } = useConfirm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty) return;
    const parsed = priceRuleSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setServerError(null);
    setSaving(true);
    try {
      const saved = await adminFetch<PriceRule>(rule ? `price-rules/${rule.id}` : 'price-rules', {
        method: rule ? 'PATCH' : 'POST',
        body: parsed.data,
      });
      toast('success', rule ? 'Regla actualizada' : 'Regla creada');
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

  async function onDelete() {
    if (!rule) return;
    const ok = await confirm({
      title: `¿Borrar la regla «${rule.name}»?`,
      message: 'Las noches que cubría vuelven a su precio normal. No se puede deshacer.',
      confirmLabel: 'Borrar regla',
      danger: true,
    });
    if (!ok) return;
    setSaving(true);
    try {
      await adminFetch<void>(`price-rules/${rule.id}`, { method: 'DELETE' });
      toast('success', 'Regla borrada');
      onDeleted?.();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'No se pudo borrar.');
      setSaving(false);
    }
  }

  const preview = describe(values);

  return (
    <Panel>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormError message={serverError?.message ?? null} details={serverError?.details} />
        <Field label="Nombre" htmlFor="pr-name" error={errors.name} hint="Ej.: Puente de Reyes, Semana Santa, Temporada de fin de año">
          <input
            id="pr-name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
            maxLength={120}
            {...invalidProps('pr-name', errors.name)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primera noche" htmlFor="pr-start" error={errors.startDate}>
            <input
              id="pr-start"
              type="date"
              value={values.startDate}
              onChange={(e) => {
                const start = e.target.value;
                setValues((v) => ({ ...v, startDate: start, endDate: v.endDate < start ? start : v.endDate }));
              }}
              className={inputClass}
              {...invalidProps('pr-start', errors.startDate)}
            />
          </Field>
          <Field label="Última noche (incluida)" htmlFor="pr-end" error={errors.endDate}>
            <input
              id="pr-end"
              type="date"
              min={values.startDate}
              value={values.endDate}
              onChange={(e) => set('endDate', e.target.value)}
              className={inputClass}
              {...invalidProps('pr-end', errors.endDate)}
            />
          </Field>
        </div>
        <p className="-mt-2 text-xs text-tinta-suave">
          Son las noches que se cobran: para un festivo el lunes, normalmente la noche especial es el domingo.
        </p>

        <Field label={`Aplica a`} htmlFor="pr-room" hint={`Todas las ${roomLabel.toLowerCase()} o solo una.`}>
          <select id="pr-room" value={values.roomId} onChange={(e) => set('roomId', e.target.value)} className={inputClass}>
            <option value="">Todas las {roomLabel.toLowerCase()}</option>
            {rooms.status === 'ready' &&
              rooms.data.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                  {room.isActive ? '' : ' (inactiva)'}
                </option>
              ))}
          </select>
        </Field>

        <fieldset>
          <legend className="text-sm font-bold text-tinta">Tipo de ajuste</legend>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {[
              { value: 'PERCENT' as const, title: 'Porcentaje', text: 'Sube o baja el precio normal (ej. +15 %).' },
              { value: 'FIXED' as const, title: 'Precio fijo', text: 'Un valor por noche en pesos.' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer gap-3 rounded-xl border-2 border-arena bg-white p-3 has-checked:border-musgo-700 has-checked:bg-musgo/5"
              >
                <input
                  type="radio"
                  name="pr-type"
                  value={option.value}
                  checked={values.type === option.value}
                  // Al cambiar de tipo el valor anterior ya no tiene sentido (pesos ≠ %).
                  onChange={() => setValues((v) => ({ ...v, type: option.value, value: '' }))}
                  className="mt-1 accent-[var(--color-musgo-700)]"
                />
                <span>
                  <span className="block font-bold">{option.title}</span>
                  <span className="text-sm text-tinta-suave">{option.text}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={values.type === 'FIXED' ? 'Precio por noche (COP)' : 'Ajuste (%)'}
            htmlFor="pr-value"
            error={errors.value}
            hint={values.type === 'PERCENT' ? 'Usa negativo para descuento, ej. -10' : undefined}
          >
            {values.type === 'FIXED' ? (
              <MoneyInput
                id="pr-value"
                value={values.value}
                onChange={(v) => set('value', v)}
                placeholder="450.000"
                invalid={invalidProps('pr-value', errors.value)}
              />
            ) : (
              <input
                id="pr-value"
                inputMode="text"
                value={values.value}
                onChange={(e) => set('value', e.target.value.replace(/[^\d-]/g, '').replace(/(?!^)-/g, '').slice(0, 4))}
                className={inputClass}
                placeholder="15"
                {...invalidProps('pr-value', errors.value)}
              />
            )}
          </Field>
          <Field label="Prioridad" htmlFor="pr-priority" error={errors.priority} hint="Si dos reglas cubren la misma noche, gana el número mayor.">
            <input
              id="pr-priority"
              inputMode="numeric"
              value={values.priority}
              onChange={(e) => set('priority', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className={inputClass}
              {...invalidProps('pr-priority', errors.priority)}
            />
          </Field>
        </div>

        {preview && <p className="rounded-xl bg-musgo/10 px-4 py-3 text-sm font-semibold text-musgo-700">{preview}</p>}

        <Toggle id="pr-active" checked={values.isActive} onChange={(v) => set('isActive', v)} label="Regla activa" description="Las inactivas no afectan los precios." />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {rule ? (
            <button type="button" onClick={() => void onDelete()} disabled={saving} className={adminButton.danger}>
              <Trash2 className="size-4" aria-hidden /> Borrar regla
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={saving || !dirty} className={adminButton.primary}>
            {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
            {rule ? 'Guardar cambios' : 'Crear regla'}
          </button>
        </div>
      </form>
      {dialog}
    </Panel>
  );
}
