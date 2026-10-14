'use client';

import { ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatCopInput } from '@/lib/admin-input';
import type { StatusFilter } from '@/lib/types';

/**
 * Componentes del panel admin: más sobrio que el sitio público, pero con la
 * misma paleta y tipografía (CONTEXT §7). Pensado para usarse desde el celular.
 */

export const inputClass =
  'mt-1.5 block w-full rounded-xl border-2 border-arena bg-white px-3.5 py-2.5 text-base text-tinta placeholder:text-tinta-suave/60 focus:border-musgo-700 focus:outline-none aria-[invalid=true]:border-arcilla-700';

export const adminButton = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-bosque px-4 py-2.5 font-bold text-papel-claro transition hover:bg-bosque-900 disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-arena bg-white px-4 py-2 font-bold text-bosque transition hover:border-bosque disabled:cursor-not-allowed disabled:opacity-60',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-arcilla-700/30 bg-white px-4 py-2 font-bold text-arcilla-700 transition hover:bg-arcilla/10 disabled:cursor-not-allowed disabled:opacity-60',
  icon: 'grid size-10 place-items-center rounded-xl text-tinta-suave transition hover:bg-arena/60 hover:text-bosque disabled:opacity-35 disabled:hover:bg-transparent',
} as const;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-tinta-suave">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function NewButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={adminButton.primary}>
      <Plus className="size-5" aria-hidden /> {children}
    </Link>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-bosque/15 bg-papel-claro p-5 shadow-calida sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-bold text-tinta">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-tinta-suave">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-sm font-semibold text-arcilla-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** "120 / 200" bajo un campo de texto; en rojo si se pasa. */
export function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <p className={`mt-1 text-right text-xs font-bold tabular-nums ${over ? 'text-arcilla-700' : 'text-tinta-suave'}`}>
      {value.length} / {max}
      {over && ' · acórtala para poder guardar'}
    </p>
  );
}

/** Props de accesibilidad para un input con posible error. */
export function invalidProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {};
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="font-bold text-tinta">
          {label}
        </label>
        {description && <p className="text-sm text-tinta-suave">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative h-8 w-14 shrink-0 rounded-full bg-arena transition aria-checked:bg-musgo-700 disabled:opacity-50"
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-musgo/15 px-2.5 py-0.5 text-xs font-extrabold text-musgo-700">
      Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-arena px-2.5 py-0.5 text-xs font-extrabold text-tinta-suave">
      Inactiva
    </span>
  );
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
];

/** Búsqueda + filtro activo/inactivo de las tablas (CONTEXT §6.2). */
export function ListToolbar({
  search,
  onSearch,
  status,
  onStatus,
  placeholder = 'Buscar por nombre',
}: {
  search: string;
  onSearch: (value: string) => void;
  status: StatusFilter;
  onStatus: (value: StatusFilter) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <span className="sr-only">Buscar</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} mt-0 pl-11`}
        />
      </label>
      <div role="radiogroup" aria-label="Estado" className="flex rounded-xl border-2 border-arena bg-white p-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={status === option.value}
            onClick={() => onStatus(option.value)}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm font-bold text-tinta-suave aria-checked:bg-bosque aria-checked:text-papel-claro sm:flex-none"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LoadingBlock({ label = 'Cargando…' }: { label?: string }) {
  return (
    <p role="status" className="flex items-center justify-center gap-2 py-12 font-semibold text-tinta-suave">
      <LoaderCircle className="size-5 animate-spin" aria-hidden /> {label}
    </p>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border-2 border-arcilla-700/25 bg-arcilla/5 px-5 py-6 text-center">
      <CircleAlert className="mx-auto size-8 text-arcilla-700" aria-hidden />
      <p className="mt-2 font-bold text-arcilla-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${adminButton.secondary} mt-4`}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-arena px-5 py-10 text-center">
      <p className="font-display text-xl text-bosque">{title}</p>
      {children && <div className="mt-2 text-tinta-suave">{children}</div>}
    </div>
  );
}

/** Mensaje de error del servidor arriba del formulario (con detalles de validación). */
export function FormError({ message, details = [] }: { message: string | null; details?: string[] }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border-2 border-arcilla-700/25 bg-arcilla/5 px-4 py-3 text-sm">
      <p className="font-bold text-arcilla-700">{message}</p>
      {details.length > 0 && (
        <ul className="mt-1 list-disc pl-5 text-arcilla-700">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Precio en pesos: se escribe con punto de miles mientras se teclea
 * ("300000" → "300.000"). Guarda el texto formateado; el esquema lo convierte a número.
 */
export function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
  className = '',
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  invalid?: Record<string, unknown>;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 font-bold text-tinta-suave">$</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(formatCopInput(e.target.value))}
        placeholder={placeholder}
        className={`${inputClass} pl-8 font-semibold tabular-nums`}
        {...invalid}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-xs font-bold text-tinta-suave">COP</span>
    </div>
  );
}

/** Paginador de las listas del panel: «Página 2 de 3» con anterior / siguiente. */
export function AdminPager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const arrow =
    'grid size-10 place-items-center rounded-xl border-2 border-arena bg-white text-bosque transition hover:border-bosque disabled:opacity-35 disabled:hover:border-arena';
  return (
    <nav aria-label="Páginas" className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-tinta-suave">{total} en total</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className={arrow}>
          <ChevronLeft className="size-5" aria-hidden />
          <span className="sr-only">Página anterior</span>
        </button>
        <span className="min-w-28 text-center text-sm font-bold" aria-live="polite">
          Página {page} de {totalPages}
        </span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} className={arrow}>
          <ChevronRight className="size-5" aria-hidden />
          <span className="sr-only">Página siguiente</span>
        </button>
      </div>
    </nav>
  );
}
