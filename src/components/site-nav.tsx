'use client';

import { ClipboardList, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { countItems, useRequest } from '@/lib/request-store';

export interface NavLink {
  href: string;
  label: string;
}

function RequestLink({ onClick }: { onClick?: () => void }) {
  const count = countItems(useRequest());
  return (
    <Link
      href="/solicitud"
      onClick={onClick}
      className="relative inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ambar px-3.5 py-2 text-sm font-bold text-selva shadow-calida transition duration-200 hover:-translate-y-0.5 hover:bg-ambar-claro sm:px-4"
    >
      <ClipboardList className="size-4" aria-hidden />
      <span className="max-sm:sr-only">Mi solicitud</span>
      {count > 0 && (
        <span className="grid min-w-5 place-items-center rounded-full bg-selva px-1.5 text-xs leading-5 text-ambar">
          {count}
          <span className="sr-only"> {count === 1 ? 'ítem' : 'ítems'}</span>
        </span>
      )}
    </Link>
  );
}

export function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  // El menú queda abierto solo en la ruta donde se abrió: al navegar se cierra solo.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenOn(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? 'page' : undefined}
            className="rounded-full px-3.5 py-2 font-semibold text-papel/80 transition-colors duration-200 hover:bg-papel/10 hover:text-papel-claro aria-[current=page]:text-papel-claro aria-[current=page]:underline aria-[current=page]:decoration-ambar aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
          >
            {link.label}
          </Link>
        ))}
        <span className="ml-3">
          <RequestLink />
        </span>
      </nav>

      <div className="flex items-center gap-2 lg:hidden">
        <RequestLink />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="grid size-11 place-items-center rounded-full text-papel-claro hover:bg-papel/10"
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
      </div>

      {open && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="absolute inset-x-0 top-full border-b border-papel/10 bg-selva px-4 pb-6 pt-2 shadow-calida-lg lg:hidden"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className="block border-b border-dashed border-papel/15 py-3.5 font-display text-xl text-papel-claro aria-[current=page]:text-ambar"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
