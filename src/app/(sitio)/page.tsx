import { ArrowRight, Flame, MapPin, Sparkles, Trees } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { WhatsAppIcon } from '@/components/brand-icons';
import { HorsebackCard, ProductCard, RoomCard } from '@/components/cards';
import { HorseSilhouette, Leaf, MountainsEdge } from '@/components/decor';
import { HeroLandscape } from '@/components/hero-landscape';
import { Reveal } from '@/components/reveal';
import { RoomLabelText, SafeSection } from '@/components/safe-section';
import {
  buttonStyles,
  CardGridSkeleton,
  Container,
  EmptyState,
  SectionHeading,
} from '@/components/ui';
import { getHorsebackRides, getProducts, getRooms, getSettings } from '@/lib/api';
import { singularLabel } from '@/lib/format';
import { whatsappUrl } from '@/lib/whatsapp';

const PILLARS = [
  {
    Icon: Trees,
    title: 'Naturaleza alrededor',
    text: 'Despierta con el canto de los pájaros, entre montañas, guaduales y el rumor de la quebrada.',
  },
  {
    Icon: Flame,
    title: 'Calidez de finca',
    text: 'Cabañas de madera, fogón, tinto campesino y la atención cercana de la gente del rancho.',
  },
  {
    Icon: Sparkles,
    title: 'Descanso de verdad',
    text: 'Jacuzzi, hamacas y noches estrelladas. Sin afanes: aquí el tiempo va al paso del caballo.',
  },
];

async function HeroActions() {
  await connection();
  const settings = await getSettings();
  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      <Link href="/cabanas" className={buttonStyles.clay}>
        Ver {settings.roomLabel.toLowerCase()} <ArrowRight className="size-5" aria-hidden />
      </Link>
      {settings.whatsappNumber && (
        <a
          href={whatsappUrl(settings.whatsappNumber, settings.whatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-papel-claro/80 px-6 py-2.5 font-bold text-papel-claro transition duration-200 hover:-translate-y-0.5 hover:bg-papel-claro hover:text-bosque"
        >
          <WhatsAppIcon className="size-5" /> Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}

async function FeaturedRooms() {
  await connection();
  const [settings, rooms] = await Promise.all([getSettings(), getRooms()]);
  if (rooms.length === 0) {
    return <EmptyState title="Muy pronto">Estamos preparando las {settings.roomLabel.toLowerCase()}.</EmptyState>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.slice(0, 3).map((room, i) => (
        <Reveal key={room.id} delay={i * 90}>
          <RoomCard
            room={room}
            roomSingular={singularLabel(settings.roomLabel)}
            fridayNightIsWeekend={settings.fridayNightIsWeekend}
          />
        </Reveal>
      ))}
    </div>
  );
}

async function FeaturedRides() {
  await connection();
  const rides = await getHorsebackRides();
  if (rides.length === 0) return <EmptyState title="Las cabalgatas vuelven pronto" />;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {rides.slice(0, 2).map((ride, i) => (
        <Reveal key={ride.id} delay={i * 90}>
          <HorsebackCard ride={ride} />
        </Reveal>
      ))}
    </div>
  );
}

async function FeaturedProducts() {
  await connection();
  const products = await getProducts();
  if (products.length === 0) return <EmptyState title="Pronto tendremos productos de la finca" />;
  return (
    <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {products.slice(0, 4).map((product, i) => (
        <Reveal key={product.id} delay={i * 70}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}

async function LocationBlurb() {
  await connection();
  const settings = await getSettings();
  return (
    <p className="mt-4 text-lg text-tinta-suave">
      {settings.address ? (
        <>
          Estamos en <strong className="text-tinta">{settings.address}</strong>
          {settings.city && `, ${settings.city}`}.
        </>
      ) : (
        'Te contamos cómo llegar por WhatsApp.'
      )}
    </p>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero a pantalla completa */}
      <section className="relative isolate -mt-px flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden">
        <HeroLandscape className="absolute inset-0 -z-20 h-full w-full" />
        {/* Overlay verde oscuro para legibilidad */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bosque-900/90 via-bosque-900/45 to-transparent" />
        <Container className="pb-16 pt-32 sm:pb-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="font-hand text-3xl text-arena sm:text-4xl">Bienvenido al rancho</p>
            <h1 className="mt-2 text-5xl font-semibold leading-[1.05] text-papel-claro sm:text-6xl lg:text-7xl">
              Donde la montaña <em className="font-normal italic text-arena">te abraza</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-papel/90 sm:text-xl">
              Cabañas de madera con jacuzzi, cabalgatas al atardecer y los sabores de la finca. Arma
              tu plan aquí y lo confirmamos contigo por WhatsApp.
            </p>
            <Suspense fallback={<div className="mt-9 h-12" />}>
              <HeroActions />
            </Suspense>
          </div>
        </Container>
      </section>

      {/* Propuesta de valor */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="La vida en el rancho" title="Un refugio para bajar el ritmo" />
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="card-papel h-full p-7 text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-musgo/15 text-musgo-700">
                    <Icon className="size-8" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-2xl">{title}</h3>
                  <p className="mt-2 leading-relaxed text-tinta-suave">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Cabañas destacadas */}
      <section className="relative pb-20">
        <Container>
          <SectionHeading eyebrow="Para quedarse" title={<>Nuestras <RoomLabelText lower /></>}>
            Precios por noche entre semana y fin de semana, a la vista. Elige fechas y calcula tu total.
          </SectionHeading>
          <SafeSection what="el alojamiento" fallback={<CardGridSkeleton count={3} />}>
            <FeaturedRooms />
          </SafeSection>
          <div className="mt-10 text-center">
            <Link href="/cabanas" className={buttonStyles.outline}>
              Ver todas <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* Cabalgatas */}
      <section className="relative">
        <MountainsEdge className="text-arena" />
        <div className="bg-arena pb-20 pt-8">
          <Container>
            <div className="flex justify-center text-madera/70">
              <HorseSilhouette className="h-14 w-20" />
            </div>
            <SectionHeading eyebrow="Al paso del caballo" title="Cabalgatas por la montaña">
              Recorridos guiados por potreros, bosque y quebrada. Para principiantes y para quienes ya
              saben montar.
            </SectionHeading>
            <SafeSection what="las cabalgatas" fallback={<CardGridSkeleton count={2} />}>
              <FeaturedRides />
            </SafeSection>
          </Container>
        </div>
        <MountainsEdge className="rotate-180 text-arena" />
      </section>

      {/* Productos */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Hecho en la finca" title="Para llevar a casa">
            Miel, café, quesos y artesanías de la vereda. Agrégalos a tu solicitud y te los tenemos
            listos.
          </SectionHeading>
          <SafeSection what="los productos" fallback={<CardGridSkeleton count={4} />}>
            <FeaturedProducts />
          </SafeSection>
          <div className="mt-10 text-center">
            <Link href="/productos" className={buttonStyles.outline}>
              Ver productos <ArrowRight className="size-5" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* Ubicación y contacto */}
      <section>
        <Container>
          <div className="card-papel relative overflow-hidden p-8 sm:p-12">
            <Leaf className="absolute -right-6 -top-6 size-40 rotate-12 text-musgo/15" />
            <div className="relative max-w-2xl">
              <p className="font-hand text-2xl text-arcilla-700">Te esperamos</p>
              <h2 className="text-3xl font-semibold sm:text-4xl">¿Cómo llegar al rancho?</h2>
              <Suspense fallback={<p className="mt-4 h-7" />}>
                <LocationBlurb />
              </Suspense>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/contacto" className={buttonStyles.primary}>
                  <MapPin className="size-5" aria-hidden /> Ver ubicación y contacto
                </Link>
                <Link href="/solicitud" className={buttonStyles.outline}>
                  Revisar mi solicitud
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

