import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Horseshoe, MountainsEdge } from '@/components/decor';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col bg-papel">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-bosque text-arena">
              <Horseshoe className="size-9" />
            </span>
            <h1 className="mt-4 text-3xl font-semibold">Panel del rancho</h1>
            <p className="mt-1 text-tinta-suave">Entra para administrar el sitio.</p>
          </div>
          <div className="rounded-2xl border border-madera/15 bg-papel-claro p-6 shadow-calida">
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
