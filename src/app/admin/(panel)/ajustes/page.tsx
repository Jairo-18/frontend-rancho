'use client';

import { LoaderCircle, Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useAdmin } from '@/components/admin/admin-shell';
import { useToast } from '@/components/admin/toast';
import {
  adminButton,
  ErrorBlock,
  Field,
  FormError,
  inputClass,
  invalidProps,
  LoadingBlock,
  PageHeader,
  Panel,
  Toggle,
} from '@/components/admin/ui';
import { AdminApiError, adminFetch } from '@/lib/admin-api';
import { fieldErrors, settingsSchema, type SettingsFormValues } from '@/lib/admin-schemas';
import type { Settings } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { whatsappUrl } from '@/lib/whatsapp';

function SettingsForm({ settings, onSaved }: { settings: Settings; onSaved: (s: Settings) => void }) {
  const toast = useToast();
  const { reloadSettings } = useAdmin();
  const [values, setValues] = useState<SettingsFormValues>(() => ({
    ...settings,
    socials: { ...settings.socials },
    recommendations: [...settings.recommendations],
    houseRules: [...settings.houseRules],
    bookingTerms: [...settings.bookingTerms],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{ message: string; details: string[] } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const setSocial = (key: keyof SettingsFormValues['socials'], value: string) =>
    setValues((v) => ({ ...v, socials: { ...v.socials, [key]: value } }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = settingsSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setServerError(null);
    setSaving(true);
    try {
      const saved = await adminFetch<Settings>('settings', { method: 'PUT', body: parsed.data });
      toast('success', 'Ajustes guardados: ya se ven en el sitio.');
      onSaved(saved);
      reloadSettings();
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

  const text = (
    key: 'hotelName' | 'address' | 'city' | 'mapsUrl' | 'email' | 'phone' | 'checkInTime' | 'checkOutTime' | 'sharedAreas',
    label: string,
    hint?: string,
    type = 'text',
  ) => (
    <Field label={label} htmlFor={`st-${key}`} error={errors[key]} hint={hint}>
      <input
        id={`st-${key}`}
        type={type}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
        {...invalidProps(`st-${key}`, errors[key])}
      />
    </Field>
  );

  const lines = (key: 'recommendations' | 'houseRules' | 'bookingTerms', label: string, hint: string) => (
    <div className="sm:col-span-2">
      <Field label={label} htmlFor={`st-${key}`} error={errors[key]} hint={hint}>
        <textarea
          id={`st-${key}`}
          rows={Math.min(10, Math.max(3, values[key].length + 1))}
          value={values[key].join('\n')}
          onChange={(e) => set(key, e.target.value.split('\n'))}
          className={inputClass}
          {...invalidProps(`st-${key}`, errors[key])}
        />
      </Field>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <FormError message={serverError?.message ?? null} details={serverError?.details} />

      <Panel>
        <h2 className="mb-4 text-xl">WhatsApp</h2>
        <div className="space-y-5">
          <Field
            label="Número de WhatsApp"
            htmlFor="st-whatsapp"
            error={errors.whatsappNumber}
            hint="Con indicativo de país, sin + ni espacios. Ej.: 573001234567"
          >
            <input
              id="st-whatsapp"
              inputMode="tel"
              value={values.whatsappNumber}
              onChange={(e) => set('whatsappNumber', e.target.value)}
              className={inputClass}
              {...invalidProps('st-whatsapp', errors.whatsappNumber)}
            />
          </Field>
          <Field label="Saludo cuando no hay solicitud armada" htmlFor="st-greeting" error={errors.whatsappGreeting}>
            <textarea
              id="st-greeting"
              rows={2}
              value={values.whatsappGreeting}
              onChange={(e) => set('whatsappGreeting', e.target.value)}
              className={inputClass}
            />
          </Field>
          {/^\d{10,15}$/.test(values.whatsappNumber.replace(/\D/g, '')) && (
            <a
              href={whatsappUrl(values.whatsappNumber, values.whatsappGreeting || 'Prueba')}
              target="_blank"
              rel="noopener noreferrer"
              className={adminButton.secondary}
            >
              Probar el enlace de WhatsApp
            </a>
          )}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-xl">Sitio</h2>
        <div className="space-y-5">
          {text('hotelName', 'Nombre del hotel')}
          <fieldset>
            <legend className="text-sm font-bold">¿Cómo llamar al alojamiento en el sitio?</legend>
            <div className="mt-1.5 flex gap-2">
              {(['Cabañas', 'Habitaciones'] as const).map((label) => (
                <label key={label} className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border-2 border-arena bg-white px-3 py-2.5 font-semibold has-checked:border-musgo-700 has-checked:bg-musgo/5">
                  <input
                    type="radio"
                    name="st-roomLabel"
                    checked={values.roomLabel === label}
                    onChange={() => set('roomLabel', label)}
                    className="accent-[var(--color-musgo-700)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Toggle
            id="st-friday"
            checked={values.fridayNightIsWeekend}
            onChange={(v) => set('fridayNightIsWeekend', v)}
            label="La noche del viernes se cobra como fin de semana"
            description="Si está apagado, el viernes se cobra como entre semana."
          />
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-xl">Contacto y ubicación</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {text('address', 'Dirección')}
          {text('city', 'Ciudad o municipio')}
          {text('phone', 'Teléfono', 'Opcional', 'tel')}
          {text('email', 'Correo', 'Opcional', 'email')}
          <div className="sm:col-span-2">{text('mapsUrl', 'Enlace de Google Maps', 'Para el botón «Cómo llegar»', 'url')}</div>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-xl">Información para el huésped</h2>
        <p className="mb-4 mt-1 text-sm text-tinta-suave">
          Se muestra en el detalle de cada cabaña y en «Cómo llegar → Antes de venir». Deja un campo
          vacío para ocultarlo.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {text('checkInTime', 'Hora de llegada', 'Ej.: 3:00 p. m.')}
          {text('checkOutTime', 'Hora de salida', 'Ej.: 12:00 m.')}
          <div className="sm:col-span-2">{text('sharedAreas', 'Zonas comunes', 'Ej.: Cocina, kiosko, parrilla y barril asador')}</div>
          <div className="sm:col-span-2">
            <Field label="Mascotas" htmlFor="st-pets" error={errors.petsPolicy}>
              <textarea
                id="st-pets"
                rows={2}
                value={values.petsPolicy}
                onChange={(e) => set('petsPolicy', e.target.value)}
                className={inputClass}
                {...invalidProps('st-pets', errors.petsPolicy)}
              />
            </Field>
          </div>
          {lines('recommendations', 'Recomendaciones', 'Una por línea.')}
          {lines('houseRules', 'Normas de la casa', 'Una por línea. Se muestran resaltadas en rojo.')}
          {lines('bookingTerms', 'Condiciones de reserva', 'Una por línea, con el formato «Título: texto». Ej.: Saldo: el resto se paga al llegar.')}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-xl">Redes sociales</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {(['instagram', 'facebook', 'tiktok'] as const).map((key) => (
            <Field key={key} label={key[0].toUpperCase() + key.slice(1)} htmlFor={`st-${key}`} error={errors[`socials.${key}`]}>
              <input
                id={`st-${key}`}
                type="url"
                placeholder="https://"
                value={values.socials[key]}
                onChange={(e) => setSocial(key, e.target.value)}
                className={inputClass}
                {...invalidProps(`st-${key}`, errors[`socials.${key}`])}
              />
            </Field>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button type="submit" disabled={saving} className={`${adminButton.primary} shadow-calida-lg`}>
          {saving ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Save className="size-5" aria-hidden />}
          Guardar ajustes
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const settings = useAdminData<Settings>('settings/public');
  return (
    <>
      <PageHeader title="Ajustes" description="WhatsApp, nombre, ubicación, información para el huésped y redes que se muestran en el sitio." />
      {settings.status === 'loading' && <LoadingBlock />}
      {settings.status === 'error' && <ErrorBlock message={settings.error} onRetry={settings.reload} />}
      {settings.status === 'ready' && <SettingsForm settings={settings.data} onSaved={settings.mutate} />}
    </>
  );
}
