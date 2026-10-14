'use client';

import {
  BedDouble,
  CalendarPlus,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  ImageOff,
  Info,
  PackagePlus,
  Plus,
  Settings as SettingsIcon,
  ShoppingBasket,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { WhatsAppIcon } from '@/components/brand-icons';
import { useAdmin } from '@/components/admin/admin-shell';
import { HorseSilhouette } from '@/components/decor';
import { formatDate, todayInBogota, weekdayName } from '@/lib/format';
import { DESCRIPTION_MAX } from '@/lib/admin-schemas';
import type { AdminHorseback, AdminProduct, AdminRoom, PriceRule } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { whatsappUrl } from '@/lib/whatsapp';


/** Botón grande de acción rápida. */
function Shortcut({
  href,
  icon,
  title,
  text,
  external = false,
  tone = 'light',
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
  external?: boolean;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  const className = `group flex items-center gap-3 rounded-2xl border p-4 shadow-calida transition hover:-translate-y-0.5 hover:shadow-calida-lg ${
    dark ? 'border-selva bg-selva text-papel-claro' : 'border-bosque/15 bg-papel-claro'
  }`;
  const content = (
    <>
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl ${dark ? 'bg-selva-700 text-ambar' : 'bg-musgo/15 text-musgo-700'}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-bold ${dark ? 'text-papel-claro' : 'text-tinta'}`}>{title}</span>
        <span className={`block text-sm ${dark ? 'text-papel/75' : 'text-tinta-suave'}`}>{text}</span>
      </span>
      {external ? (
        <ExternalLink className={`size-4 shrink-0 ${dark ? 'text-ambar' : 'text-tinta-suave'}`} aria-hidden />
      ) : (
        <ChevronRight
          className={`size-5 shrink-0 transition group-hover:translate-x-0.5 ${dark ? 'text-ambar' : 'text-tinta-suave'}`}
          aria-hidden
        />
      )}
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/** Contador de una sección con acceso a crear. */
function StatCard({
  href,
  newHref,
  icon,
  title,
  items,
  masculine = false,
}: {
  href: string;
  newHref: string;
  icon: ReactNode;
  title: string;
  items: { isActive: boolean }[] | undefined;
  /** "activos" (productos) en vez de "activas". */
  masculine?: boolean;
}) {
  const active = items?.filter((item) => item.isActive).length ?? 0;
  const inactive = (items?.length ?? 0) - active;
  return (
    <div className="flex flex-col rounded-2xl border border-bosque/15 bg-papel-claro p-4 shadow-calida">
      <Link href={href} className="flex items-center gap-3 hover:text-arcilla-700">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-musgo/15 text-musgo-700">{icon}</span>
        <span className="font-display text-xl text-bosque">{title}</span>
      </Link>
      <p className="mt-3 font-display text-4xl font-semibold text-tinta">{items ? active : '…'}</p>
      <p className="text-sm text-tinta-suave">
        {items ? (
          <>
            {masculine ? 'publicados' : 'publicadas'}
            {inactive > 0 && ` · ${inactive} ${masculine ? 'ocultos' : 'ocultas'}`}
          </>
        ) : (
          'Cargando…'
        )}
      </p>
      <Link
        href={newHref}
        className="mt-3 inline-flex items-center gap-1 self-start rounded-full border-2 border-bosque/20 px-3 py-1 text-sm font-bold text-bosque transition hover:border-bosque hover:bg-bosque hover:text-papel-claro"
      >
        <Plus className="size-4" aria-hidden /> Agregar
      </Link>
    </div>
  );
}

interface Recent {
  id: string;
  name: string;
  href: string;
  kind: string;
  image: string | null;
  isActive: boolean;
  updatedAt: string;
}

export default function AdminHomePage() {
  const { settings, roomLabel, roomSingular } = useAdmin();
  const today = todayInBogota();
  const rooms = useAdminData<AdminRoom[]>('rooms/admin?status=all');
  const rides = useAdminData<AdminHorseback[]>('horseback/admin?status=all');
  const products = useAdminData<AdminProduct[]>('products/admin?status=all');
  const rules = useAdminData<PriceRule[]>('price-rules?status=active');

  const upcoming = (rules.data ?? []).filter((rule) => rule.endDate >= today).slice(0, 5);

  // Pendientes: lo que hace que algo no se vea bien (o no se vea) en el sitio.
  const todo: ReactNode[] = [];
  if (settings && !settings.whatsappNumber) {
    todo.push(
      <>
        Falta el{' '}
        <Link href="/admin/ajustes" className="underline">
          número de WhatsApp
        </Link>
        : sin él nadie puede enviar su solicitud.
      </>,
    );
  }
  if (settings && !settings.logoUrl) {
    todo.push(
      <>
        Aún no hay{' '}
        <Link href="/admin/ajustes" className="underline">
          logo
        </Link>
        : el sitio muestra una hoja en su lugar.
      </>,
    );
  }
  for (const room of rooms.data ?? []) {
    if (room.images.length === 0) {
      todo.push(
        <>
          «
          <Link href={`/admin/cabanas/${room.id}`} className="underline">
            {room.name}
          </Link>
          » no tiene fotos: sube una y se publica sola.
        </>,
      );
    } else if (!room.isActive) {
      todo.push(
        <>
          «
          <Link href={`/admin/cabanas/${room.id}`} className="underline">
            {room.name}
          </Link>
          » está oculta: actívala para que se vea.
        </>,
      );
    }
    if (room.description.length > DESCRIPTION_MAX) {
      todo.push(
        <>
          La descripción de «
          <Link href={`/admin/cabanas/${room.id}`} className="underline">
            {room.name}
          </Link>
          » tiene {room.description.length} caracteres: acórtala a {DESCRIPTION_MAX}.
        </>,
      );
    }
  }
  for (const [list, base] of [
    [rides.data, '/admin/cabalgatas'],
    [products.data, '/admin/productos'],
  ] as const) {
    for (const item of list ?? []) {
      if (item.description.length > DESCRIPTION_MAX) {
        todo.push(
          <>
            La descripción de «
            <Link href={`${base}/${item.id}`} className="underline">
              {item.name}
            </Link>
            » tiene {item.description.length} caracteres: acórtala a {DESCRIPTION_MAX}.
          </>,
        );
      }
    }
  }
  const loaded = rooms.status === 'ready' && rides.status === 'ready' && products.status === 'ready';

  const recent: Recent[] = [
    ...(rooms.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      href: `/admin/cabanas/${r.id}`,
      kind: roomSingular,
      image: r.coverImageUrl,
      isActive: r.isActive,
      updatedAt: r.updatedAt,
    })),
    ...(rides.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      href: `/admin/cabalgatas/${r.id}`,
      kind: 'Cabalgata',
      image: r.coverImageUrl,
      isActive: r.isActive,
      updatedAt: r.updatedAt,
    })),
    ...(products.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      href: `/admin/productos/${p.id}`,
      kind: 'Producto',
      image: p.imageUrl,
      isActive: p.isActive,
      updatedAt: p.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <>
      <header className="mb-6">
        <p className="text-sm font-bold capitalize text-tinta-suave">
          {weekdayName(today)} {formatDate(today).split(' ').slice(1).join(' ')}
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">¡Hola{settings ? `, ${settings.hotelName}` : ''}!</h1>
        <p className="mt-1 text-tinta-suave">¿Qué quieres hacer hoy?</p>
      </header>

      {/* Acciones rápidas */}
      <section aria-labelledby="atajos" className="mb-8">
        <h2 id="atajos" className="sr-only">
          Acciones rápidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Shortcut
            href="/admin/cabanas/nueva"
            icon={<BedDouble className="size-6" aria-hidden />}
            title={`Nueva ${roomSingular.toLowerCase()}`}
            text="Datos, precios, fotos y lo que incluye"
            tone="dark"
          />
          <Shortcut
            href="/admin/productos/nuevo"
            icon={<PackagePlus className="size-6" aria-hidden />}
            title="Nuevo producto"
            text="Vino, decoración, desayunos…"
          />
          <Shortcut
            href="/admin/cabalgatas/nueva"
            icon={<HorseSilhouette className="size-7" />}
            title="Nueva cabalgata"
            text="Duración, precio y horario"
          />
          <Shortcut
            href="/admin/reglas-precio/nueva"
            icon={<CalendarPlus className="size-6" aria-hidden />}
            title="Tarifa especial"
            text="Festivos o temporada alta"
          />
          <Shortcut
            href="/admin/ajustes"
            icon={<SettingsIcon className="size-6" aria-hidden />}
            title="Ajustes"
            text="WhatsApp, logo, horarios y normas"
          />
          <Shortcut
            href="/"
            icon={<ExternalLink className="size-6" aria-hidden />}
            title="Ver el sitio"
            text="Así lo ven tus clientes"
            external
          />
          {settings?.whatsappNumber && (
            <Shortcut
              href={whatsappUrl(settings.whatsappNumber, settings.whatsappGreeting || 'Prueba')}
              icon={<WhatsAppIcon className="size-6" />}
              title="Probar WhatsApp"
              text={`Abre el chat con +${settings.whatsappNumber}`}
              external
            />
          )}
        </div>
      </section>

      {/* Pendientes */}
      <section aria-labelledby="pendientes" className="mb-8">
        <h2 id="pendientes" className="mb-3 flex items-center gap-2 text-xl">
          <Info className="size-5 text-arcilla-700" aria-hidden /> Pendientes
        </h2>
        {todo.length > 0 ? (
          <ul className="space-y-2">
            {todo.map((item, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-xl border-2 border-arcilla-700/25 bg-arcilla/5 px-4 py-3 text-sm font-semibold text-arcilla-700"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          loaded && (
            <p className="flex items-center gap-2 rounded-xl bg-musgo/10 px-4 py-3 font-semibold text-musgo-700">
              <CircleCheck className="size-5" aria-hidden /> Todo en orden: no hay nada pendiente.
            </p>
          )
        )}
      </section>

      {/* Contadores */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          href="/admin/cabanas"
          newHref="/admin/cabanas/nueva"
          icon={<BedDouble className="size-6" aria-hidden />}
          title={roomLabel}
          items={rooms.data}
        />
        <StatCard
          href="/admin/cabalgatas"
          newHref="/admin/cabalgatas/nueva"
          icon={<HorseSilhouette className="size-7" />}
          title="Cabalgatas"
          items={rides.data}
        />
        <StatCard
          href="/admin/productos"
          newHref="/admin/productos/nuevo"
          icon={<ShoppingBasket className="size-6" aria-hidden />}
          title="Productos"
          items={products.data}
          masculine
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Últimos cambios */}
        <section aria-labelledby="recientes">
          <h2 id="recientes" className="mb-3 text-xl">
            Lo último que editaste
          </h2>
          {recent.length === 0 ? (
            <p className="text-tinta-suave">{loaded ? 'Aún no hay nada creado.' : 'Cargando…'}</p>
          ) : (
            <ul className="divide-y divide-bosque/10 overflow-hidden rounded-2xl border border-bosque/15 bg-papel-claro">
              {recent.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link href={item.href} className="flex items-center gap-3 px-3 py-2.5 hover:bg-arena/40">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
                      <img src={item.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-arena text-tinta-suave">
                        <ImageOff className="size-5" aria-hidden />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{item.name}</span>
                      <span className="text-xs text-tinta-suave">
                        {item.kind} · {item.isActive ? 'publicado' : 'oculto'}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-tinta-suave" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Próximas tarifas */}
        <section aria-labelledby="tarifas">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="tarifas" className="flex items-center gap-2 text-xl">
              <CalendarRange className="size-5 text-arcilla-700" aria-hidden /> Próximas tarifas especiales
            </h2>
            <Link href="/admin/reglas-precio" className="text-sm font-bold text-bosque underline">
              Ver todas
            </Link>
          </div>
          {rules.status === 'ready' && upcoming.length === 0 && (
            <p className="text-tinta-suave">No hay tarifas especiales próximas.</p>
          )}
          {upcoming.length > 0 && (
            <ul className="divide-y divide-bosque/10 rounded-2xl border border-bosque/15 bg-papel-claro">
              {upcoming.map((rule) => (
                <li key={rule.id}>
                  <Link
                    href={`/admin/reglas-precio/${rule.id}`}
                    className="flex justify-between gap-3 px-4 py-2.5 hover:bg-arena/40"
                  >
                    <span className="font-semibold">{rule.name}</span>
                    <span className="text-sm text-tinta-suave">{formatDate(rule.startDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
