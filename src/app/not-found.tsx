import Link from 'next/link';
import { Monstera } from '@/components/decor';
import { buttonStyles, Container } from '@/components/ui';

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <Monstera className="mx-auto size-24 text-musgo" />
      <p className="mt-4 font-hand text-3xl text-arcilla-700">Uy, este sendero se perdió en la selva</p>
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
