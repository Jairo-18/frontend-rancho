'use client';

import { Check, LoaderCircle, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { formatCopInput } from '@/lib/admin-input';
import { DESCRIPTION_MAX, fieldErrors, roomSchema, type RoomFormValues } from '@/lib/admin-schemas';
import { formatMoney } from '@/lib/format';
import type { AdminProduct, AdminRoom } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { useAdmin } from './admin-shell';
import { useToast } from './toast';
import { AMENITY_SUGGESTIONS, TagInput } from './tag-input';
import { adminButton, CharCount, Field, FormError, inputClass, invalidProps, MoneyInput, Panel, Toggle } from './ui';
import { useFormState } from './use-form-state';

function initialValues(room?: AdminRoom): RoomFormValues {
  return {
    name: room?.name ?? '',
    description: room?.description ?? '',
    hasJacuzzi: room?.hasJacuzzi ?? false,
    amenities: [...(room?.amenities ?? [])],
    capacity: room?.capacity?.toString() ?? '',
    weekdayPrice: room ? formatCopInput(String(room.weekdayPrice)) : '',
    weekendPrice: room ? formatCopInput(String(room.weekendPrice)) : '',
    productIds: [...(room?.productIds ?? [])].sort(),
  };
}

/** Productos que se ofrecen junto con la cabaña en el sitio. */
function ProductPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const products = useAdminData<AdminProduct[]>('products/admin?status=all');
  if (products.status === 'loading') return <p className="text-sm text-tinta-suave">Cargando productos…</p>;
  if (products.status === 'error') return <p className="text-sm text-arcilla-700">{products.error}</p>;
  if (products.data.length === 0) {
    return <p className="text-sm text-tinta-suave">Aún no hay productos. Créalos en «Productos» para ofrecerlos aquí.</p>;
  }
  const toggle = (id: string) =>
    onChange((selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]).sort());
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {products.data.map((product) => {
        const checked = selected.includes(product.id);
        return (
          <li key={product.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(product.id)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-arena bg-white px-3 py-2.5 text-left transition hover:border-musgo-700 aria-checked:border-musgo-700 aria-checked:bg-musgo/5"
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${checked ? 'border-musgo-700 bg-musgo-700 text-white' : 'border-arena'}`}
              >
                {checked && <Check className="size-4" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{product.name}</span>
                <span className="text-sm text-tinta-suave">
                  {formatMoney(product.price)}
                  {!product.isActive && ' · inactivo (no se muestra)'}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Datos de la cabaña. Crear: POST; editar: PATCH. Devuelve la cabaña guardada. */
export function RoomForm({ room, onSaved }: { room?: AdminRoom; onSaved: (room: AdminRoom) => void }) {
  const { roomSingular } = useAdmin();
  const toast = useToast();
  const { values, set, dirty, markSaved } = useFormState<RoomFormValues>(() => initialValues(room));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty) return;
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
        <Field
          label="Descripción"
          htmlFor="room-description"
          error={errors.description}
          hint="Corta y atractiva: aparece en las tarjetas y al inicio del detalle. Lo que incluye va abajo, como etiquetas."
        >
          <textarea
            id="room-description"
            rows={6}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
            {...invalidProps('room-description', errors.description)}
          />
          <CharCount value={values.description} max={DESCRIPTION_MAX} />
        </Field>
        <Field
          label="Lo que incluye"
          htmlFor="room-amenities"
          error={errors.amenities}
          hint="Cada cosa es una etiqueta: escríbela y presiona Enter, o toca una sugerencia."
        >
          <TagInput
            id="room-amenities"
            value={values.amenities}
            onChange={(tags) => set('amenities', tags)}
            suggestions={AMENITY_SUGGESTIONS}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio entre semana (por noche)" htmlFor="room-weekday" error={errors.weekdayPrice} hint="Lunes a jueves (o viernes, según Ajustes)">
            <MoneyInput
              id="room-weekday"
              value={values.weekdayPrice}
              onChange={(v) => set('weekdayPrice', v)}
              placeholder="250.000"
              invalid={invalidProps('room-weekday', errors.weekdayPrice)}
            />
          </Field>
          <Field label="Precio fin de semana (por noche)" htmlFor="room-weekend" error={errors.weekendPrice} hint="Sábado y domingo (y viernes, según Ajustes)">
            <MoneyInput
              id="room-weekend"
              value={values.weekendPrice}
              onChange={(v) => set('weekendPrice', v)}
              placeholder="280.000"
              invalid={invalidProps('room-weekend', errors.weekendPrice)}
            />
          </Field>
        </div>
        <Field label="Capacidad (personas)" htmlFor="room-capacity" error={errors.capacity} hint="Opcional">
          <input
            id="room-capacity"
            inputMode="numeric"
            value={values.capacity}
            onChange={(e) => set('capacity', e.target.value.replace(/\D/g, '').slice(0, 2))}
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
        <div>
          <p className="text-sm font-bold text-tinta">Productos para ofrecer con esta {roomSingular.toLowerCase()}</p>
          <p className="mb-2 text-xs text-tinta-suave">
            Aparecen en el detalle como «Hazla aún más especial» para agregarlos a la solicitud (vino, decoración…).
          </p>
          <ProductPicker selected={values.productIds} onChange={(ids) => set('productIds', ids)} />
          {errors.productIds && <p className="mt-1 text-sm font-semibold text-arcilla-700">{errors.productIds}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving || !dirty} className={`${adminButton.primary} w-full sm:w-auto`}>
            {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
            {room ? 'Guardar cambios' : `Crear ${roomSingular.toLowerCase()}`}
          </button>
          {!dirty && room && <span className="text-sm text-tinta-suave">Sin cambios por guardar</span>}
        </div>
      </form>
    </Panel>
  );
}
