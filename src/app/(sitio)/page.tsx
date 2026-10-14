import { ArrowRight, Heart, MapPin, Moon, Trees } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { AmbientVideo } from '@/components/ambient-video';
import { WhatsAppIcon } from '@/components/brand-icons';
import { HorsebackCard, ProductCard, RoomCard } from '@/components/cards';
import { CanopyEdge } from '@/components/decor';
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
import { PHOTOS, type SitePhoto, VIDEOS } from '@/lib/photos';
import { whatsappUrl } from '@/lib/whatsapp';

const PILLARS = [
  {
    Icon: Trees,
    title: 'Dormir dentro de la selva',
    text: 'Cabañas de madera rodeadas de árboles, helechos y flores. Te despiertan los pájaros y el verde entra por la ventana.',
  },
  {
    Icon: Moon,
    title: 'Noches cálidas',
    text: 'Jacuzzi con vista al bosque, luces de bombillo y el canto de las ranas cuando cae la noche.',
  },
  {
    Icon: Heart,
    title: 'Aventura y compañía',
    text: 'Escápate en pareja o ven en grupo: camping, rutas de senderismo, fogata con masmelos y cabalgatas con la montaña de fondo.',
  },
];

const ROMANTIC_MESSAGE =
  'Hola, quiero preparar una sorpresa en una de sus cabañas. ¿Qué opciones de decoración tienen?';

const lightButton =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-papel-claro/80 px-6 py-2.5 font-bold text-papel-claro transition duration-200 hover:-translate-y-0.5 hover:bg-papel-claro hover:text-selva';

/**
 * Foto con marco cálido y esquinas orgánicas (mosaicos y collages). `className`
 * debe traer la posición (`relative` o `absolute`) porque la imagen usa `fill`.
 */
function FramedPhoto({
  photo,
  sizes,
  className = '',
  priority = false,
}: {
  photo: SitePhoto;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-[var(--radius-organico)] shadow-calida-lg ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        className="object-cover transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
}

async function HeroActions() {
  await connection();
  const settings = await getSettings();
  return (
    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
      <Link href="/cabanas" className={buttonStyles.amber}>
        Ver {settings.roomLabel.toLowerCase()} <ArrowRight className="size-5" aria-hidden />
      </Link>
      {settings.whatsappNumber && (
        <a
          href={whatsappUrl(settings.whatsappNumber, settings.whatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
          className={lightButton}
        >
          <WhatsAppIcon className="size-5" /> Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}

async function RomanticAction() {
  await connection();
  const settings = await getSettings();
  if (!settings.whatsappNumber) {
    return (
      <Link href="/contacto" className={buttonStyles.amber}>
        Escríbenos para planearla <ArrowRight className="size-5" aria-hidden />
      </Link>
    );
  }
  return (
    <a
      href={whatsappUrl(settings.whatsappNumber, ROMANTIC_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonStyles.amber}
    >
      <WhatsAppIcon className="size-5" /> Planear una sorpresa
    </a>
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
    <p className="mt-4 text-lg text-papel/90">
      {settings.address ? (
        <>
          Estamos en <strong className="text-papel-claro">{settings.address}</strong>
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
      {/* Hero: foto a pantalla completa en móvil, collage en escritorio */}
      <section className="follaje relative isolate overflow-hidden">
        <Image
          src={PHOTOS.cabanaAFrame.src}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 1px, 100vw"
          className="-z-20 object-cover object-[50%_35%] lg:hidden"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-selva via-selva/60 to-selva/10 lg:hidden" />
        <Container className="grid min-h-[calc(100svh-4.5rem)] items-end gap-12 pb-20 pt-32 lg:min-h-0 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
          <div className="max-w-2xl animate-fade-up">
            <p className="font-hand text-3xl text-ambar sm:text-4xl">Piedemonte amazónico · Mocoa</p>
            <h1 className="mt-2 text-5xl font-semibold leading-[1.05] text-papel-claro sm:text-6xl lg:text-7xl">
              Despierta en medio <em className="font-normal italic text-ambar-claro">de la selva</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-papel/90 sm:text-xl">
              Cabañas de madera rodeadas de bosque, jacuzzi bajo las estrellas, cabalgatas y noches
              para dos. Arma tu plan aquí y lo confirmamos contigo por WhatsApp.
            </p>
            <Suspense fallback={<div className="mt-9 h-12" />}>
              <HeroActions />
            </Suspense>
          </div>

          <div className="relative hidden h-[34rem] lg:block" aria-hidden>
            <FramedPhoto
              photo={PHOTOS.cabanaAFrame}
              sizes="340px"
              priority
              className="absolute right-6 top-0 h-[28rem] w-[21rem] rotate-2"
            />
            <FramedPhoto
              photo={PHOTOS.jacuzziSelvaNoche}
              sizes="260px"
              priority
              className="absolute bottom-0 left-0 h-[21rem] w-[16rem] -rotate-3 ring-8 ring-selva"
            />
            <span className="absolute bottom-10 right-0 rotate-[-4deg] rounded-full bg-ambar px-5 py-2 font-hand text-2xl text-selva shadow-calida-lg">
              Noches con jacuzzi
            </span>
          </div>
        </Container>
        <CanopyEdge className="-mb-px text-papel" />
      </section>

      {/* La experiencia: texto + mosaico de fotos */}
      <section className="py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Así se vive el rancho" title="Un refugio verde para bajar el ritmo">
              Lejos del ruido, entre montañas, bosques y rutas de senderismo del Putumayo. Cabañas, camping
              y aire puro para descansar y dejar que la selva haga lo suyo.
            </SectionHeading>
            <div className="space-y-6">
              {PILLARS.map(({ Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 100}>
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-musgo/15 text-musgo-700">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="mt-1 leading-relaxed text-tinta-suave">{text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <FramedPhoto
                photo={PHOTOS.banoGuadua}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="col-span-2 aspect-[4/3] sm:aspect-[16/10] relative"
              />
              <FramedPhoto
                photo={PHOTOS.cabanaInterior}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="aspect-[3/4] relative"
              />
              <FramedPhoto
                photo={PHOTOS.carpasNoche}
                sizes="(min-width: 1024px) 280px, 50vw"
                className="aspect-[3/4] relative"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Cabañas destacadas */}
      <section className="relative pb-20">
        <Container>
          <SectionHeading eyebrow="Para quedarse" title={<>Nuestras <RoomLabelText lower /></>}>
            Madera, follaje y descanso. Precios por noche entre semana y fin de semana, a la vista:
            elige fechas y calcula tu total.
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

      {/* Noches para dos */}
      <section className="relative">
        <CanopyEdge className="-mb-px text-selva" />
        <div className="follaje py-20 text-papel">
          <Container className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <Reveal className="order-2 lg:order-1">
              <div className="grid grid-cols-[1.15fr_1fr] gap-3 sm:gap-4 lg:grid-cols-[1.8fr_1fr]">
                <div className="relative row-span-2 overflow-hidden rounded-[var(--radius-organico)] bg-selva-800 shadow-calida-lg">
                  <AmbientVideo
                    src={VIDEOS.planRomantico.src}
                    poster={VIDEOS.planRomantico.poster}
                    label={VIDEOS.planRomantico.label}
                    className="aspect-[9/16] h-full w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto"
                  />
                </div>
                <FramedPhoto photo={PHOTOS.teAmo} sizes="(min-width: 1024px) 220px, 45vw" className="aspect-[4/5] relative" />
                <FramedPhoto
                  photo={PHOTOS.detalleRomantico}
                  sizes="(min-width: 1024px) 240px, 45vw"
                  className="aspect-[4/5] relative"
                />
              </div>
            </Reveal>
            <div className="order-1 lg:order-2">
              <p className="font-hand text-2xl text-ambar sm:text-3xl">Noches para dos</p>
              <h2 className="mt-1 text-3xl font-semibold text-papel-claro sm:text-4xl lg:text-5xl">
                Una sorpresa entre la selva
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-papel/85">
                Aniversarios, pedidas de mano o simplemente ganas de consentir a alguien. Preparamos tu
                cabaña con pétalos, velas y globos, con vino artesanal amazónico y el jacuzzi listo cuando lleguen.
              </p>
              <p className="mt-3 leading-relaxed text-papel/75">
                Cuéntanos qué celebras y armamos la sorpresa contigo por WhatsApp.
              </p>
              <div className="mt-8">
                <Suspense fallback={<div className="h-12" />}>
                  <RomanticAction />
                </Suspense>
              </div>
            </div>
          </Container>
        </div>
        <CanopyEdge className="rotate-180 text-selva" />
      </section>

      {/* Cabalgatas */}
      <section className="py-20">
        <Container>
          <div className="mb-12 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <SectionHeading align="left" eyebrow="Entre potreros y montaña" title="Cabalgatas por el rancho">
              Recorridos guiados con caballos mansos, con las montañas del Putumayo de fondo. Para
              principiantes y para quienes ya saben montar.
            </SectionHeading>
            <Reveal>
              <div className="grid grid-cols-3 gap-3">
                <FramedPhoto
                  photo={PHOTOS.cabalgataMontana}
                  sizes="(min-width: 1024px) 160px, 33vw"
                  className="aspect-[3/4] relative"
                />
                <div className="overflow-hidden rounded-[var(--radius-organico)] bg-arena shadow-calida-lg">
                  <AmbientVideo
                    src={VIDEOS.potrillo.src}
                    poster={VIDEOS.potrillo.poster}
                    label={VIDEOS.potrillo.label}
                    className="aspect-[3/4] h-full w-full object-cover"
                  />
                </div>
                <FramedPhoto
                  photo={PHOTOS.cabalgataPotrero}
                  sizes="(min-width: 1024px) 160px, 33vw"
                  className="aspect-[3/4] relative"
                />
              </div>
            </Reveal>
          </div>
          <SafeSection what="las cabalgatas" fallback={<CardGridSkeleton count={2} />}>
            <FeaturedRides />
          </SafeSection>
        </Container>
      </section>

      {/* Productos */}
      <section className="pb-20">
        <Container>
          <SectionHeading eyebrow="Hecho en la finca" title="Para llevar a casa">
            Vino artesanal amazónico y otros productos de la región. Agrégalos a tu solicitud y te los tenemos listos.
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
          <div className="relative isolate overflow-hidden rounded-[var(--radius-organico)] bg-selva shadow-calida-lg">
            <Image
              src={PHOTOS.terrazaCabana.src}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="-z-20 object-cover object-[50%_60%]"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-selva via-selva/85 to-selva/30" />
            <div className="max-w-xl p-8 sm:p-12 lg:py-16">
              <p className="font-hand text-2xl text-ambar">Te esperamos</p>
              <h2 className="text-3xl font-semibold text-papel-claro sm:text-4xl">¿Cómo llegar al rancho?</h2>
              <Suspense fallback={<p className="mt-4 h-7" />}>
                <LocationBlurb />
              </Suspense>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/contacto" className={buttonStyles.amber}>
                  <MapPin className="size-5" aria-hidden /> Ver ubicación y contacto
                </Link>
                <Link href="/solicitud" className={lightButton}>
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
