import { Clock, ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDuration, formatMoney } from '@/lib/format';
import type { Horseback, Product, Room } from '@/lib/types';
import { AddHorsebackControl, AddProductButton, AddRoomButton } from './request-buttons';
import { CapacityBadge, JacuzziBadge, PricePair } from './ui';

const CARD_SIZES = '(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw';

function CardImage({ src, alt, priority = false }: { src: string | null; alt: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="grid h-full w-full place-items-center bg-arena text-madera/60">
        <ImageOff className="size-10" aria-hidden />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={CARD_SIZES}
      priority={priority}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

const cardClass =
  'group card-papel flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-calida-lg';

export function RoomCard({
  room,
  roomSingular,
  fridayNightIsWeekend,
  priority = false,
}: {
  room: Room;
  roomSingular: string;
  fridayNightIsWeekend: boolean;
  priority?: boolean;
}) {
  return (
    <article className={cardClass}>
      <Link href={`/cabanas/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden>
        <CardImage src={room.coverImageUrl} alt="" priority={priority} />
        {room.hasJacuzzi && <JacuzziBadge className="absolute left-3 top-3" />}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-2xl font-semibold">
            <Link href={`/cabanas/${room.slug}`} className="hover:text-arcilla-700">
              {room.name}
            </Link>
          </h3>
          {room.capacity && (
            <div className="mt-1">
              <CapacityBadge capacity={room.capacity} />
            </div>
          )}
          <p className="mt-2 line-clamp-3 text-tinta-suave">{room.description}</p>
        </div>
        <PricePair
          weekdayPrice={room.weekdayPrice}
          weekendPrice={room.weekendPrice}
          fridayNightIsWeekend={fridayNightIsWeekend}
        />
        <div className="mt-auto grid gap-2">
          <Link
            href={`/cabanas/${room.slug}`}
            className="inline-flex items-center justify-center rounded-full bg-bosque px-5 py-2.5 text-sm font-bold text-papel-claro transition duration-200 hover:bg-bosque-900"
          >
            Ver {roomSingular.toLowerCase()} y calcular precio
          </Link>
          <AddRoomButton
            roomSingular={roomSingular}
            room={{ id: room.id, slug: room.slug, name: room.name, hasJacuzzi: room.hasJacuzzi }}
          />
        </div>
      </div>
    </article>
  );
}

export function HorsebackCard({ ride }: { ride: Horseback }) {
  return (
    <article className={cardClass}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <CardImage src={ride.coverImageUrl} alt={`${ride.name}: paseo a caballo en el rancho`} />
        <span className="sello absolute left-3 top-3 bg-papel-claro/95 text-bosque">
          <Clock className="size-4" aria-hidden /> {formatDuration(ride.durationMinutes)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-2xl font-semibold">{ride.name}</h3>
        <p className="text-tinta-suave">{ride.description}</p>
        {ride.schedule && (
          <p className="rounded-xl bg-arena/50 px-3 py-2 text-sm text-tinta">
            <span className="font-bold">Horario: </span>
            {ride.schedule}
          </p>
        )}
        <p className="font-display text-xl font-semibold text-madera-900">
          {ride.pricePerPerson === null ? (
            <span className="text-arcilla-700">Consultar precio</span>
          ) : (
            <>
              {formatMoney(ride.pricePerPerson)}{' '}
              <span className="font-sans text-sm font-semibold text-tinta-suave">por persona</span>
            </>
          )}
        </p>
        <div className="mt-auto">
          <AddHorsebackControl
            ride={{ id: ride.id, name: ride.name, pricePerPerson: ride.pricePerPerson }}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={cardClass}>
      <div className="relative aspect-square overflow-hidden">
        <CardImage src={product.imageUrl} alt={product.name} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl font-semibold">{product.name}</h3>
        <p className="text-sm text-tinta-suave">{product.description}</p>
        <p className="font-display text-xl font-semibold text-madera-900">{formatMoney(product.price)}</p>
        <div className="mt-auto pt-2">
          <AddProductButton product={{ id: product.id, name: product.name, price: product.price }} />
        </div>
      </div>
    </article>
  );
}
