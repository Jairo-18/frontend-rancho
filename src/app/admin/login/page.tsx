import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Monstera, MountainsEdge } from '@/components/decor';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col bg-papel">
      <div className="px-4 pt-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-bold text-bosque transition hover:bg-musgo/15"
        >
          <ArrowLeft className="size-5" aria-hidden /> Volver al sitio
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-bosque text-arena">
              <Monstera className="size-9" />
            </span>
            <h1 className="mt-4 text-3xl font-semibold">Panel del rancho</h1>
            <p className="mt-1 text-tinta-suave">Entra para administrar el sitio.</p>
          </div>
          <div className="rounded-2xl border border-bosque/15 bg-papel-claro p-6 shadow-calida">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <MountainsEdge className="text-bosque" />
      <div className="h-6 bg-bosque" />
    </div>
  );
}
