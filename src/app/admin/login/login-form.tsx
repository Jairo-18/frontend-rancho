'use client';

import { Eye, EyeOff, LoaderCircle, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { adminButton, Field, inputClass } from '@/components/admin/ui';

/** Al entrar siempre se llega al inicio del panel (pedido del usuario). */
const HOME = '/admin';

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('expirada') ? 'Tu sesión expiró. Vuelve a entrar.' : null,
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        // Recarga completa a propósito: el panel arranca con la sesión recién creada (cookies).
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(HOME);
        return;
      }
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      setError(
        res.status === 429
          ? 'Demasiados intentos. Espera un minuto e intenta de nuevo.'
          : res.status === 400
            ? 'Revisa el correo y la contraseña (mínimo 8 caracteres).'
            : (body?.message ?? 'No se pudo iniciar sesión.'),
      );
    } catch {
      setError('Sin conexión. Revisa tu internet e intenta de nuevo.');
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-xl bg-arcilla/10 px-4 py-3 text-sm font-bold text-arcilla-700">
          {error}
        </p>
      )}
      <Field label="Correo" htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <div className="relative mt-1.5">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-0 pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-tinta-suave hover:text-bosque"
          >
            {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
            <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
          </button>
        </div>
      </Field>
      <button type="submit" disabled={pending || !email || !password} className={`${adminButton.primary} w-full py-3`}>
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Lock className="size-5" aria-hidden />}
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
