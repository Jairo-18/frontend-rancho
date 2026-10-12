import Link from 'next/link';
import { HorseSilhouette } from '@/components/decor';
import { buttonStyles, Container } from '@/components/ui';

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <HorseSilhouette className="mx-auto h-24 w-32 text-madera/60" />
      <p className="mt-4 font-hand text-3xl text-arcilla-700">Uy, este caballo se desvió del camino</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">No encontramos esta página</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-tinta-suave">
        Puede que el enlace haya cambiado o que ya no esté disponible.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonStyles.primary}>Volver al inicio</Link>
        <Link href="/cabanas" className={buttonStyles.outline}>Ver cabañas</Link>
      </div>
    </Container>
  );
}
