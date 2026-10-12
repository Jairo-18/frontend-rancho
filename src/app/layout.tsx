import type { Metadata, Viewport } from 'next';
import { Caveat, Fraunces, Nunito } from 'next/font/google';
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

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'Rancho Porvenir';
const DESCRIPTION =
  'Hotel rancho ecológico: cabañas entre montañas, jacuzzi, cabalgatas y productos de la finca. Arma tu plan y consúltalo por WhatsApp.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Hotel rancho ecológico`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: SITE_NAME,
    title: `${SITE_NAME} · Hotel rancho ecológico`,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#2f4a2b',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-CO"
      className={`${fraunces.variable} ${nunito.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
