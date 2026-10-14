'use client';

import {
  BedDouble,
  CalendarRange,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  ShoppingBasket,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { logout } from '@/lib/admin-api';
import type { SessionUser, Settings } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { HorseSilhouette, Monstera } from '../decor';
import { ToastProvider } from './toast';

interface AdminContextValue {
  settings: Settings | null;
  /** "Cabañas" o "Habitaciones" según Ajustes. */
  roomLabel: string;
  roomSingular: string;
  reloadSettings: () => void;
}

const AdminContext = createContext<AdminContextValue>({
  settings: null,
  roomLabel: 'Cabañas',
  roomSingular: 'Cabaña',
  reloadSettings: () => {},
});

export const useAdmin = () => useContext(AdminContext);

function useSessionUser(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/session', { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) {
          // Navegación completa: descarta el estado del panel al perder la sesión.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign('/admin/login?expirada=1');
          return;
        }
        const body = (await res.json().catch(() => null)) as { data?: SessionUser } | null;
        if (!cancelled && body?.data) setUser(body.data);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);
  return user;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const settings = useAdminData<Settings>('settings/public');
  const user = useSessionUser();
  const [menuOn, setMenuOn] = useState<string | null>(null);
  const menuOpen = menuOn === pathname;

  const roomLabel = settings.data?.roomLabel ?? 'Cabañas';
  const roomSingular = roomLabel === 'Habitaciones' ? 'Habitación' : 'Cabaña';

  const nav = [
    { href: '/admin', label: 'Inicio', icon: <LayoutDashboard className="size-5" aria-hidden /> },
    { href: '/admin/cabanas', label: roomLabel, icon: <BedDouble className="size-5" aria-hidden /> },
    { href: '/admin/reglas-precio', label: 'Precios y festivos', icon: <CalendarRange className="size-5" aria-hidden /> },
    { href: '/admin/cabalgatas', label: 'Cabalgatas', icon: <HorseSilhouette className="size-5" /> },
    { href: '/admin/productos', label: 'Productos', icon: <ShoppingBasket className="size-5" aria-hidden /> },
    { href: '/admin/ajustes', label: 'Ajustes', icon: <SettingsIcon className="size-5" aria-hidden /> },
  ];
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const navList = (
    <ul className="space-y-1">
      {nav.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-arena/90 transition hover:bg-white/10 hover:text-papel-claro aria-[current=page]:bg-papel-claro aria-[current=page]:text-bosque"
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/15 pt-3">
      {user && <p className="truncate px-3 pb-1 text-xs text-arena/70">{user.email}</p>}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-arena/90 hover:bg-white/10 hover:text-papel-claro"
      >
        <ExternalLink className="size-5" aria-hidden /> Ver el sitio
      </a>
      <button
        type="button"
        onClick={() => void logout()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-arena/90 hover:bg-white/10 hover:text-papel-claro"
      >
        <LogOut className="size-5" aria-hidden /> Cerrar sesión
      </button>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      {settings.data?.logoUrl ? (
        <span className="rounded-lg bg-papel-claro px-1.5 py-1">
          <Image src={settings.data.logoUrl} alt="" width={52} height={36} className="h-8 w-auto object-contain" />
        </span>
      ) : (
        <span className="grid size-9 place-items-center rounded-full bg-papel-claro text-bosque">
          <Monstera className="size-5" />
        </span>
      )}
      <span className="leading-tight">
        <span className="block font-display text-lg text-papel-claro">
          {settings.data?.hotelName ?? 'Rancho Porvenir'}
        </span>
        <span className="block text-xs font-bold uppercase tracking-wider text-arena/70">Panel</span>
      </span>
    </Link>
  );

  return (
    <AdminContext.Provider
      value={{ settings: settings.data ?? null, roomLabel, roomSingular, reloadSettings: settings.reload }}
    >
      <ToastProvider>
        <div className="min-h-svh bg-papel lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Escritorio: barra lateral */}
          <aside className="hidden bg-bosque p-4 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:gap-6">
            {brand}
            <nav aria-label="Panel" className="flex-1">
              {navList}
            </nav>
            {footer}
          </aside>

          {/* Móvil: barra superior + menú */}
          <header className="sticky top-0 z-40 bg-bosque px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              {brand}
              <button
                type="button"
                onClick={() => setMenuOn(menuOpen ? null : pathname)}
                aria-expanded={menuOpen}
                aria-controls="admin-menu"
                className="grid size-11 place-items-center rounded-xl text-papel-claro hover:bg-white/10"
              >
                {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
                <span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
              </button>
            </div>
            {menuOpen && (
              <nav id="admin-menu" aria-label="Panel" className="mt-3 space-y-3 pb-2">
                {navList}
                {footer}
              </nav>
            )}
          </header>

          <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </ToastProvider>
    </AdminContext.Provider>
  );
}
