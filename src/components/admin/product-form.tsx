'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { formatCopInput } from '@/lib/admin-input';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { DESCRIPTION_MAX, fieldErrors, productSchema, type ProductFormValues } from '@/lib/admin-schemas';
import type { AdminProduct } from '@/lib/types';
import { useToast } from './toast';
import { adminButton, CharCount, Field, FormError, inputClass, invalidProps, MoneyInput, Panel } from './ui';
import { useFormState } from './use-form-state';

export function ProductForm({
  product,
  onSaved,
}: {
  product?: AdminProduct;
  onSaved: (product: AdminProduct) => void;
}) {
  const toast = useToast();
  const { values, set, dirty, markSaved } = useFormState<ProductFormValues>(() => ({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product ? formatCopInput(String(product.price)) : '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dirty) return;
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setServerError(null);
    setSaving(true);
    try {
      const saved = await adminFetch<AdminProduct>(product ? `products/${product.id}` : 'products', {
        method: product ? 'PATCH' : 'POST',
        body: parsed.data,
      });
      toast('success', product ? 'Cambios guardados' : 'Producto creado. Ahora sube su foto.');
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
        <Field label="Nombre" htmlFor="pr-name" error={errors.name}>
          <input
            id="pr-name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
            maxLength={120}
            {...invalidProps('pr-name', errors.name)}
          />
        </Field>
        <Field label="Descripción" htmlFor="pr-description" error={errors.description}>
          <textarea
            id="pr-description"
            rows={3}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            className={inputClass}
            {...invalidProps('pr-description', errors.description)}
          />
          <CharCount value={values.description} max={DESCRIPTION_MAX} />
        </Field>
        <Field label="Precio (COP)" htmlFor="pr-price" error={errors.price}>
          <MoneyInput
            id="pr-price"
            value={values.price}
            onChange={(v) => set('price', v)}
            className="sm:max-w-56"
            placeholder="50.000"
            invalid={invalidProps('pr-price', errors.price)}
          />
        </Field>
        <button type="submit" disabled={saving || !dirty} className={`${adminButton.primary} w-full sm:w-auto`}>
          {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
          {product ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </form>
    </Panel>
  );
}
