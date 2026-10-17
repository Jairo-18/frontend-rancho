import type { Metadata, Viewport } from 'next';
import { Caveat, Fraunces, Nunito } from 'next/font/google';
import { SITE_NAME, siteUrl } from '@/lib/site';
import './globals.css';

/** Títulos: serif orgánica (con cursiva para acentos). */
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK'],
});
/** Cuerpo: sans cálida y legible. */
const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });
/** Solo detalles decorativos, nunca texto largo. */
const caveat = Caveat({ variable: '--font-caveat', subsets: ['latin'], weight: ['500', '700'] });

const DESCRIPTION =
  'Cabañas de madera entre la selva de Mocoa, Putumayo: jacuzzi, cabalgatas, planes románticos y productos de la finca. Arma tu plan y consúltalo por WhatsApp.';

export const metadata: Metadata = {
  // Valor de compilación: el sitio público lo reemplaza por petición en (sitio)/layout.
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} · Cabañas en la selva de Mocoa`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Cabañas en la selva de Mocoa`,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0a3a27',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-CO"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
