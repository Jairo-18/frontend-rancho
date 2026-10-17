import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { PageLoader } from '@/components/page-loader';
import { HeaderFallback, SiteHeader } from '@/components/site-header';
import { siteUrl } from '@/lib/site';

/**
 * `SITE_URL` se lee por petición (variable del contenedor, no de compilación):
 * de ella salen canonical, og:url y og:image de todas las páginas públicas.
 */
export async function generateMetadata(): Promise<Metadata> {
  await connection();
  return { metadataBase: new URL(siteUrl()) };
}

/** Encabezado y pie del sitio público (el panel /admin tiene los suyos). */
export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <PageLoader />
      {/* Sin JavaScript no hay quien quite la pantalla de carga. */}
      <noscript>
        <style>{'#cargador{display:none!important}'}</style>
      </noscript>
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Suspense>
        <SiteFooter />
      </Suspense>
    </>
  );
}
