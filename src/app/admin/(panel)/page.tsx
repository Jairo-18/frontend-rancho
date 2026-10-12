'use client';

import { BedDouble, CalendarRange, CircleAlert, Settings as SettingsIcon, ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAdmin } from '@/components/admin/admin-shell';
import { PageHeader } from '@/components/admin/ui';
import { HorseSilhouette } from '@/components/decor';
import { formatDate, todayInBogota } from '@/lib/format';
import type { AdminHorseback, AdminProduct, AdminRoom, PriceRule } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';

function StatCard({
  href,
  icon,
  title,
  items,
  masculine = false,
}: {
  href: string;
  /** "activos/inactivos" (productos) en vez de "activas/inactivas". */
  masculine?: boolean;
  icon: ReactNode;
  title: string;
  items: { isActive: boolean }[] | undefined;
}) {
  const active = items?.filter((item) => item.isActive).length;
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-madera/15 bg-papel-claro p-4 shadow-calida transition hover:-translate-y-0.5 hover:shadow-calida-lg"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-musgo/15 text-musgo-700">{icon}</span>
      <span>
        <span className="block font-display text-xl text-bosque">{title}</span>
        <span className="text-sm text-tinta-suave">
          {items
            ? `${active} ${masculine ? 'activos' : 'activas'} · ${items.length - (active ?? 0)} ${masculine ? 'inactivos' : 'inactivas'}`
            : 'Cargando…'}
        </span>
      </span>
    </Link>
  );
}

export default function AdminHomePage() {
  const { settings, roomLabel } = useAdmin();
  const today = todayInBogota();
  const rooms = useAdminData<AdminRoom[]>('rooms/admin?status=all');
  const rides = useAdminData<AdminHorseback[]>('horseback/admin?status=all');
  const products = useAdminData<AdminProduct[]>('products/admin?status=all');
  const rules = useAdminData<PriceRule[]>('price-rules?status=active');

  const upcoming = (rules.data ?? []).filter((rule) => rule.endDate >= today).slice(0, 5);
  const roomsNeedingPhotos = (rooms.data ?? []).filter((room) => !room.isActive && room.images.length < 3);

  const warnings: ReactNode[] = [];
  if (settings && !settings.whatsappNumber) {
    warnings.push(
      <>
        Falta el <Link href="/admin/ajustes" className="underline">número de WhatsApp</Link>: sin él los visitantes no pueden enviar su solicitud.
      </>,
    );
  }
  for (const room of roomsNeedingPhotos) {
    warnings.push(
      <>
        «<Link href={`/admin/cabanas/${room.id}`} className="underline">{room.name}</Link>» tiene {room.images.length} de 3 fotos y no se ve en el sitio.
      </>,
    );
  }

  return (
    <>
      <PageHeader title={`¡Hola${settings ? `, ${settings.hotelName}` : ''}!`} description="Esto es lo que se ve hoy en el sitio." />

      {warnings.length > 0 && (
        <ul className="mb-6 space-y-2">
          {warnings.map((warning, i) => (
            <li key={i} className="flex gap-2 rounded-xl border-2 border-arcilla-700/25 bg-arcilla/5 px-4 py-3 text-sm font-semibold text-arcilla-700">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard href="/admin/cabanas" icon={<BedDouble className="size-6" aria-hidden />} title={roomLabel} items={rooms.data} />
        <StatCard href="/admin/cabalgatas" icon={<HorseSilhouette className="size-7" />} title="Cabalgatas" items={rides.data} />
        <StatCard href="/admin/productos" icon={<ShoppingBasket className="size-6" aria-hidden />} title="Productos" items={products.data} masculine />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl">
            <CalendarRange className="size-5 text-arcilla-700" aria-hidden /> Próximas tarifas especiales
          </h2>
          <Link href="/admin/reglas-precio" className="text-sm font-bold text-bosque underline">
            Ver todas
          </Link>
        </div>
        {rules.status === 'ready' && upcoming.length === 0 && (
          <p className="text-tinta-suave">No hay reglas activas próximas.</p>
        )}
        {upcoming.length > 0 && (
          <ul className="divide-y divide-madera/10 rounded-2xl border border-madera/15 bg-papel-claro">
            {upcoming.map((rule) => (
              <li key={rule.id}>
                <Link href={`/admin/reglas-precio/${rule.id}`} className="flex justify-between gap-3 px-4 py-2.5 hover:bg-arena/40">
                  <span className="font-semibold">{rule.name}</span>
                  <span className="text-sm text-tinta-suave">{formatDate(rule.startDate)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/admin/ajustes"
        className="mt-8 inline-flex items-center gap-2 font-bold text-bosque underline underline-offset-4"
      >
        <SettingsIcon className="size-4" aria-hidden /> Ajustes del sitio (WhatsApp, dirección, redes)
      </Link>
    </>
  );
}
