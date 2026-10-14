'use client';

import { ArrowRight, BedDouble, LoaderCircle, ShoppingBasket, Trash2, UserRound, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatDate, formatMoney, nightsBetween, pluralize, singularLabel } from '@/lib/format';
import { MAX_GUESTS, MAX_QUANTITY, requestActions, useRequest } from '@/lib/request-store';
import type { Settings } from '@/lib/types';
import { useQuote } from '@/lib/use-quote';
import {
  buildRequestMessage,
  cleanName,
  computeTotals,
  isSelectionEmpty,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  whatsappUrl,
} from '@/lib/whatsapp';
import { WhatsAppIcon } from './brand-icons';
import { WhatsAppPreview } from './whatsapp-preview';
import { HorseSilhouette, Leaf } from './decor';
import { DateFields } from './price-calculator';
import { QuoteBreakdown } from './quote-breakdown';
import { Stepper } from './request-buttons';
import { buttonStyles } from './ui';

const ICON = 'size-5 text-arcilla-700';

function Block({ title, icon, children, action }: { title: string; icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card-papel p-5 sm:p-6" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl">
          {icon} {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-full text-arcilla-700 transition hover:bg-arcilla/10"
    >
      <Trash2 className="size-5" aria-hidden />
      <span className="sr-only">{label}</span>
    </button>
  );
}

/**
 * "Mi solicitud": resumen, total estimado y envío por WhatsApp. Todo vive en el
 * navegador; no se guarda nada en el backend (CONTEXT §3.5).
 */
export function RequestSummary({ settings }: { settings: Settings }) {
  const selection = useRequest();
  const quote = useQuote(selection.room?.id, selection.checkIn, selection.checkOut);
  const readyQuote = quote.status === 'ready' ? quote.quote : null;
  const totals = computeTotals(selection, readyQuote);
  const roomSingular = singularLabel(settings.roomLabel);
  const hasDates = Boolean(selection.checkIn && selection.checkOut && nightsBetween(selection.checkIn, selection.checkOut) > 0);

  if (isSelectionEmpty(selection)) {
    return (
      <div className="card-papel mx-auto max-w-xl px-6 py-14 text-center">
        <Leaf className="mx-auto size-14 text-musgo" />
        <h2 className="mt-4 text-3xl">Tu solicitud está vacía</h2>
        <p className="mt-3 text-tinta-suave">
          Elige una {roomSingular.toLowerCase()}, suma cabalgatas o productos y aquí verás el total
          estimado para enviarlo por WhatsApp.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cabanas" className={buttonStyles.primary}>
            Ver {settings.roomLabel.toLowerCase()} <ArrowRight className="size-5" aria-hidden />
          </Link>
          {settings.whatsappNumber && (
            <a
              href={whatsappUrl(settings.whatsappNumber, settings.whatsappGreeting)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.outline}
            >
              <WhatsAppIcon className="size-5" /> Solo quiero preguntar
            </a>
          )}
        </div>
      </div>
    );
  }

  const nameMissing = cleanName(selection.name).length < MIN_NAME_LENGTH;
  const roomMissing = !selection.room;
  const datesMissing = Boolean(selection.room) && !hasDates;
  const message = buildRequestMessage(selection, readyQuote, settings.roomLabel, settings.hotelName);
  const canSend =
    Boolean(settings.whatsappNumber) && !nameMissing && !roomMissing && !datesMissing && quote.status !== 'loading';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="space-y-6">
        <Block title="Tus datos" icon={<UserRound className={ICON} aria-hidden />}>
          <label htmlFor="solicitud-nombre" className="font-bold">
            ¿A nombre de quién?
          </label>
          <input
            id="solicitud-nombre"
            type="text"
            autoComplete="name"
            required
            maxLength={MAX_NAME_LENGTH}
            value={selection.name}
            onChange={(event) => requestActions.setName(event.target.value)}
            placeholder="Tu nombre"
            aria-describedby="solicitud-nombre-ayuda"
            className="mt-2 w-full rounded-2xl border-2 border-arena bg-papel-claro px-4 py-3 text-lg outline-none transition focus:border-bosque"
          />
          <p id="solicitud-nombre-ayuda" className="mt-2 text-sm text-tinta-suave">
            Va al inicio del mensaje para saber con quién hablamos. No lo guardamos: solo queda en tu
            navegador.
          </p>
        </Block>

        <Block title={roomSingular} icon={<BedDouble className={ICON} aria-hidden />}>
          {selection.room ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/cabanas/${selection.room.slug}`} className="font-display text-2xl text-bosque hover:text-arcilla-700">
                    {selection.room.name}
                  </Link>
                  {selection.room.hasJacuzzi && <p className="text-sm font-bold text-arcilla-700">Con jacuzzi</p>}
                </div>
                <RemoveButton label={`Quitar ${selection.room.name}`} onClick={requestActions.removeRoom} />
              </div>
              <DateFields
                idPrefix="solicitud"
                checkIn={selection.checkIn ?? ''}
                checkOut={selection.checkOut ?? ''}
                onChange={(a, b) => requestActions.setDates(a || null, b || null)}
              />
              <div aria-live="polite">
                {!hasDates && (
                  <p className="rounded-2xl bg-arcilla/10 px-4 py-3 font-semibold text-arcilla-700">
                    Elige la fecha de entrada y de salida para calcular el precio.
                  </p>
                )}
                {quote.status === 'loading' && (
                  <p className="flex items-center gap-2 font-semibold text-tinta-suave">
                    <LoaderCircle className="size-5 animate-spin" aria-hidden /> Calculando precio…
                  </p>
                )}
                {quote.status === 'error' && (
                  <p role="alert" className="rounded-2xl bg-arcilla/10 px-4 py-3 font-semibold text-arcilla-700">
                    {quote.message}
                  </p>
                )}
                {readyQuote && <QuoteBreakdown quote={readyQuote} />}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-arena px-4 py-6 text-center">
              <p className="font-semibold">
                Para consultar disponibilidad necesitamos que elijas una {roomSingular.toLowerCase()}.
              </p>
              <Link href="/cabanas" className={`${buttonStyles.outline} mt-4`}>
                Elegir {roomSingular.toLowerCase()}
              </Link>
            </div>
          )}
        </Block>

        <Block title="Personas" icon={<Users className={ICON} aria-hidden />}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-tinta-suave">¿Cuántas personas vienen?</p>
            <Stepper value={selection.guests} onChange={requestActions.setGuests} max={MAX_GUESTS} label="Personas" />
          </div>
        </Block>

        <Block
          title="Cabalgatas"
          icon={<HorseSilhouette className={ICON} />}
          action={<Link href="/cabalgatas" className="text-sm font-bold text-bosque underline underline-offset-4">Agregar</Link>}
        >
          {selection.horseback.length === 0 ? (
            <p className="text-tinta-suave">Sin cabalgatas. ¿Te animas a una al atardecer?</p>
          ) : (
            <ul className="divide-y divide-dashed divide-bosque/20">
              {selection.horseback.map((ride) => (
                <li key={ride.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{ride.name}</p>
                    <p className="text-sm text-tinta-suave">
                      {ride.pricePerPerson === null
                        ? 'Precio por confirmar'
                        : `${formatMoney(ride.pricePerPerson)} por persona · ${formatMoney(ride.pricePerPerson * ride.people)}`}
                    </p>
                  </div>
                  <Stepper
                    value={ride.people}
                    onChange={(people) => requestActions.upsertHorseback(ride, people)}
                    max={MAX_GUESTS}
                    label={`Personas para ${ride.name}`}
                  />
                  <RemoveButton label={`Quitar ${ride.name}`} onClick={() => requestActions.removeHorseback(ride.id)} />
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block
          title="Productos"
          icon={<ShoppingBasket className={ICON} aria-hidden />}
          action={<Link href="/productos" className="text-sm font-bold text-bosque underline underline-offset-4">Agregar</Link>}
        >
          {selection.products.length === 0 ? (
            <p className="text-tinta-suave">Sin productos por ahora.</p>
          ) : (
            <ul className="divide-y divide-dashed divide-bosque/20">
              {selection.products.map((product) => (
                <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-tinta-suave">
                      {formatMoney(product.price)} c/u · {formatMoney(product.price * product.quantity)}
                    </p>
                  </div>
                  <Stepper
                    value={product.quantity}
                    onChange={(q) => requestActions.setProductQuantity(product.id, q)}
                    max={MAX_QUANTITY}
                    label={`Cantidad de ${product.name}`}
                  />
                  <RemoveButton label={`Quitar ${product.name}`} onClick={() => requestActions.removeProduct(product.id)} />
                </li>
              ))}
            </ul>
          )}
        </Block>
      </div>

      {/* Resumen y envío */}
      <aside className="lg:sticky lg:top-24" aria-label="Total y envío">
        <div className="card-papel overflow-hidden">
          <div className="follaje px-6 py-5 text-papel-claro">
            <h2 className="text-2xl text-papel-claro">Total estimado</h2>
            <p className="mt-1 font-display text-4xl font-semibold" aria-live="polite">
              {formatMoney(totals.total)}
              <span className="ml-1 font-sans text-base font-semibold text-arena">COP</span>
            </p>
          </div>
          <dl className="space-y-2 px-6 py-5 text-sm">
            {selection.room && (
              <div className="flex justify-between gap-3">
                <dt>
                  {roomSingular}
                  {readyQuote && ` · ${pluralize(readyQuote.nightsCount, 'noche', 'noches')}`}
                </dt>
                <dd className="font-bold tabular-nums">{readyQuote ? formatMoney(totals.room) : '—'}</dd>
              </div>
            )}
            {selection.horseback.length > 0 && (
              <div className="flex justify-between gap-3">
                <dt>Cabalgatas</dt>
                <dd className="font-bold tabular-nums">{formatMoney(totals.horseback)}</dd>
              </div>
            )}
            {selection.products.length > 0 && (
              <div className="flex justify-between gap-3">
                <dt>Productos</dt>
                <dd className="font-bold tabular-nums">{formatMoney(totals.products)}</dd>
              </div>
            )}
            {selection.checkIn && selection.checkOut && hasDates && (
              <p className="border-t border-dashed border-bosque/25 pt-3 text-tinta-suave">
                {formatDate(selection.checkIn)} → {formatDate(selection.checkOut)}
              </p>
            )}
          </dl>
          <div className="space-y-3 px-6 pb-6">
            <p className="text-xs leading-relaxed text-tinta-suave">
              Es un valor estimado, <strong>sujeto a confirmación por el hotel</strong>.
              {totals.hasUnpricedItems && ' Las cabalgatas con precio por confirmar no están sumadas.'} No se
              hace ningún pago ni reserva aquí: lo confirmamos contigo por WhatsApp.
            </p>
            {canSend ? (
              <a
                href={whatsappUrl(settings.whatsappNumber, message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.whatsapp} w-full text-lg`}
              >
                <WhatsAppIcon className="size-6" /> Enviar por WhatsApp
              </a>
            ) : (
              <button type="button" disabled className={`${buttonStyles.whatsapp} w-full text-lg`}>
                <WhatsAppIcon className="size-6" /> Enviar por WhatsApp
              </button>
            )}
            {!canSend && (
              <p className="text-center text-sm font-semibold text-arcilla-700">
                {!settings.whatsappNumber
                  ? 'El hotel aún no configuró su WhatsApp.'
                  : nameMissing
                    ? 'Escribe tu nombre para enviar.'
                    : roomMissing
                    ? `Elige una ${roomSingular.toLowerCase()} para enviar.`
                    : datesMissing
                      ? 'Elige las fechas para enviar.'
                      : 'Calculando…'}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Vaciar tu solicitud?')) requestActions.clear();
              }}
              className="w-full text-center text-sm font-bold text-tinta-suave underline underline-offset-4 hover:text-arcilla-700"
            >
              Vaciar solicitud
            </button>
          </div>
        </div>

        <div className="mt-6">
          <WhatsAppPreview message={message} hotelName={settings.hotelName} />
        </div>
      </aside>
    </div>
  );
}
