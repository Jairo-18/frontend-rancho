import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { connection } from 'next/server';
import { getSettings } from '@/lib/api';
import { whatsappUrl } from '@/lib/whatsapp';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './brand-icons';
import { BrandLogo } from './brand-logo';
import { CanopyEdge } from './decor';
import { WhatsAppFloat } from './whatsapp-float';

export async function SiteFooter() {
  await connection();
  const settings = await getSettings();
  const year = new Date().getFullYear();
  const socials = [
    { href: settings.socials.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: settings.socials.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: settings.socials.tiktok, label: 'TikTok', Icon: TikTokIcon },
  ].filter((social) => social.href);

  return (
    <>
      <footer className="mt-24">
        <CanopyEdge className="-mb-px text-selva" />
        <div className="follaje pb-24 pt-10 text-arena lg:pb-10">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3">
            <div>
              <BrandLogo logoUrl={settings.logoUrl} hotelName={settings.hotelName} size="lg" />
              <p className="mt-3 max-w-xs leading-relaxed text-arena/90">
                Cabañas de madera entre la selva del piedemonte amazónico, jacuzzi, cabalgatas y noches
                para dos. Ven a desconectarte con el sonido del bosque.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg text-papel-claro">Contacto</h2>
              <ul className="mt-3 space-y-2.5">
                {settings.whatsappNumber && (
                  <li>
                    <a
                      href={whatsappUrl(settings.whatsappNumber, settings.whatsappGreeting)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 hover:text-papel-claro hover:underline"
                    >
                      <WhatsAppIcon className="size-5" /> WhatsApp
                    </a>
                  </li>
                )}
                {settings.phone && (
                  <li>
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-papel-claro hover:underline">
                      <Phone className="size-5" aria-hidden /> {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 break-all hover:text-papel-claro hover:underline">
                      <Mail className="size-5 shrink-0" aria-hidden /> {settings.email}
                    </a>
                  </li>
                )}
                {settings.address && (
                  <li>
                    <Link href="/contacto" className="inline-flex items-start gap-2 hover:text-papel-claro hover:underline">
                      <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
                      <span>
                        {settings.address}
                        {settings.city && `, ${settings.city}`}
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg text-papel-claro">Explora</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2.5">
                <li><Link className="hover:text-papel-claro hover:underline" href="/cabanas">{settings.roomLabel}</Link></li>
                <li><Link className="hover:text-papel-claro hover:underline" href="/cabalgatas">Cabalgatas</Link></li>
                <li><Link className="hover:text-papel-claro hover:underline" href="/productos">Productos</Link></li>
                <li><Link className="hover:text-papel-claro hover:underline" href="/solicitud">Mi solicitud</Link></li>
                <li><Link className="hover:text-papel-claro hover:underline" href="/contacto#antes-de-venir">Antes de venir</Link></li>
              </ul>
              {socials.length > 0 && (
                <ul className="mt-6 flex gap-3">
                  {socials.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-11 place-items-center rounded-full border border-arena/30 transition duration-200 hover:-translate-y-0.5 hover:bg-arena/10"
                      >
                        <Icon className="size-5" />
                        <span className="sr-only">{label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-6xl border-t border-arena/15 px-4 pt-6 text-sm text-arena/75 sm:px-6">
            © {year} {settings.hotelName}. Los precios son estimados y se confirman por WhatsApp.
          </p>
        </div>
      </footer>
      <WhatsAppFloat number={settings.whatsappNumber} greeting={settings.whatsappGreeting} />
    </>
  );
}
