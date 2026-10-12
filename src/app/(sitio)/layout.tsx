import { Suspense } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { HeaderFallback, SiteHeader } from '@/components/site-header';

/** Encabezado y pie del sitio público (el panel /admin tiene los suyos). */
export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
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
