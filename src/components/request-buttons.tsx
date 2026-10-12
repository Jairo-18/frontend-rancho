'use client';

import { Check, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MAX_GUESTS, MAX_QUANTITY, requestActions, useRequest } from '@/lib/request-store';
import type { RequestRoom } from '@/lib/whatsapp';
import { buttonStyles } from './ui';

export function Stepper({
  value,
  onChange,
  min = 1,
  max,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  /** Nombre accesible, p. ej. "Personas". */
  label: string;
}) {
  const btn =
    'grid size-10 place-items-center rounded-full text-bosque transition hover:bg-arena disabled:opacity-35 disabled:hover:bg-transparent';
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border-2 border-arena bg-papel-claro"
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min}>
        <Minus className="size-4" aria-hidden />
        <span className="sr-only">Quitar uno</span>
      </button>
      <output className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max}>
        <Plus className="size-4" aria-hidden />
        <span className="sr-only">Agregar uno</span>
      </button>
    </div>
  );
}

function AddedNote({ text }: { text: string }) {
  return (
    <p role="status" className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-musgo-700">
      <Check className="size-4" aria-hidden /> {text}
      <Link href="/solicitud" className="text-bosque underline underline-offset-4">
        Ver mi solicitud
      </Link>
    </p>
  );
}

/** Solo cabe una cabaña por solicitud: agregar otra la reemplaza. */
export function AddRoomButton({
  room,
  roomSingular,
  className = '',
}: {
  room: RequestRoom;
  roomSingular: string;
  className?: string;
}) {
  const selection = useRequest();
  const inRequest = selection.room?.id === room.id;
  const replacing = selection.room && !inRequest;

  if (inRequest) {
    return (
      <div className={className}>
        <AddedNote text={`${roomSingular} en tu solicitud`} />
      </div>
    );
  }
  return (
    <div className={`space-y-1.5 ${className}`}>
      <button
        type="button"
        className={`${buttonStyles.outline} w-full text-sm`}
        onClick={() => requestActions.setRoom(room)}
      >
        <Plus className="size-4" aria-hidden />
        {replacing ? 'Cambiar por esta' : 'Agregar a mi solicitud'}
      </button>
      {replacing && (
        <p className="text-xs text-tinta-suave">Reemplaza a «{selection.room?.name}» en tu solicitud.</p>
      )}
    </div>
  );
}

export function AddHorsebackControl({
  ride,
}: {
  ride: { id: string; name: string; pricePerPerson: number | null };
}) {
  const selection = useRequest();
  const current = selection.horseback.find((h) => h.id === ride.id);
  const [people, setPeople] = useState<number | null>(null);
  const value = people ?? current?.people ?? selection.guests;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-tinta-suave">Personas</span>
        <Stepper value={value} onChange={setPeople} max={MAX_GUESTS} label={`Personas para ${ride.name}`} />
      </div>
      <button
        type="button"
        className={`${buttonStyles.outline} w-full text-sm`}
        onClick={() => {
          requestActions.upsertHorseback(ride, value);
          setPeople(null);
        }}
        disabled={current?.people === value}
      >
        <Plus className="size-4" aria-hidden />
        {current ? 'Actualizar personas' : 'Agregar a mi solicitud'}
      </button>
      {current && <AddedNote text={`En tu solicitud para ${current.people}`} />}
    </div>
  );
}

export function AddProductButton({
  product,
}: {
  product: { id: string; name: string; price: number };
}) {
  const selection = useRequest();
  const current = selection.products.find((p) => p.id === product.id);
  return (
    <div className="space-y-2">
      <button
        type="button"
        className={`${buttonStyles.outline} w-full text-sm`}
        onClick={() => requestActions.addProduct(product)}
        disabled={(current?.quantity ?? 0) >= MAX_QUANTITY}
      >
        <Plus className="size-4" aria-hidden />
        {current ? 'Agregar otro' : 'Agregar a mi solicitud'}
      </button>
      {current && <AddedNote text={`Llevas ${current.quantity}`} />}
    </div>
  );
}
