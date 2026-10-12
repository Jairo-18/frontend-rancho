'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { buttonStyles, Container } from '@/components/ui';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="py-24 text-center">
      <TriangleAlert className="mx-auto size-14 text-arcilla-700" aria-hidden />
      <h1 className="mt-4 text-4xl font-semibold">Algo se nos enredó</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-tinta-suave">
        No pudimos mostrar esta página. Intenta de nuevo en un momento.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className={buttonStyles.primary}>
          Reintentar
        </button>
        <Link href="/" className={buttonStyles.outline}>Volver al inicio</Link>
      </div>
    </Container>
  );
}
