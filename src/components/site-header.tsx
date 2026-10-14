import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { DEFAULT_SETTINGS, getSettings } from '@/lib/api';
import type { Settings } from '@/lib/types';
import { Monstera } from './decor';
import { SiteNav } from './site-nav';

function navLinks(settings: Settings) {
  return [
    { href: '/', label: 'Inicio' },
    { href: '/cabanas', label: settings.roomLabel },
    { href: '/cabalgatas', label: 'Cabalgatas' },
    { href: '/productos', label: 'Productos' },
    { href: '/contacto', label: 'Cómo llegar' },
  ];
}

function HeaderShell({ settings, nav }: { settings: Settings; nav: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-papel/10 bg-selva/95 backdrop-blur-md">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ambar focus:px-4 focus:py-2 focus:text-selva"
      >
        Saltar al contenido
      </a>
      <div className="relative mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label={`${settings.hotelName}, inicio`}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-selva-700 text-ambar transition-transform duration-300 group-hover:-rotate-12">
            <Monstera className="size-6" />
          </span>
          <span className="whitespace-nowrap font-display text-xl font-semibold leading-tight text-papel-claro sm:text-2xl">
            {settings.hotelName}
          </span>
        </Link>
        {nav}
      </div>
    </header>
  );
}

/** Encabezado con los ajustes del panel (nombre y rótulo "Cabañas"/"Habitaciones"). */
export async function SiteHeader() {
  await connection();
  const settings = await getSettings();
  return <HeaderShell settings={settings} nav={<SiteNav links={navLinks(settings)} />} />;
}

/**
 * Versión del encabezado que va en la parte estática de la página (antes de
 * que lleguen los ajustes): enlaces simples, sin la ruta activa ni el contador
 * de la solicitud, que dependen del navegador.
 */
export function HeaderFallback() {
  return (
    <HeaderShell
      settings={DEFAULT_SETTINGS}
      nav={
        <nav aria-label="Principal" className="flex items-center gap-1">
          <span className="hidden items-center gap-1 lg:flex">
            {navLinks(DEFAULT_SETTINGS).map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3.5 py-2 font-semibold text-papel/80">
                {link.label}
              </Link>
            ))}
          </span>
          <Link
            href="/solicitud"
            className="ml-3 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ambar px-3.5 py-2 text-sm font-bold text-selva sm:px-4"
          >
            <ClipboardList className="size-4" aria-hidden />
            <span className="max-sm:sr-only">Mi solicitud</span>
          </Link>
        </nav>
      }
    />
  );
}
