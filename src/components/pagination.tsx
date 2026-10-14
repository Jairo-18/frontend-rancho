import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/** Paginador de los listados (enlaces `?pagina=n`, sin JavaScript). No se muestra con 1 página. */
export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?pagina=${n}`);
  const arrow =
    'grid size-11 place-items-center rounded-full border-2 border-bosque/20 text-bosque transition hover:border-bosque hover:bg-bosque hover:text-papel-claro';
  return (
    <nav aria-label="Páginas" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={arrow}>
          <ChevronLeft className="size-5" aria-hidden />
          <span className="sr-only">Página anterior</span>
        </Link>
      ) : (
        <span className={`${arrow} pointer-events-none opacity-30`} aria-hidden>
          <ChevronLeft className="size-5" />
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? 'page' : undefined}
          className="grid size-11 place-items-center rounded-full font-bold text-bosque transition hover:bg-musgo/15 aria-[current=page]:bg-bosque aria-[current=page]:text-papel-claro"
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={arrow}>
          <ChevronRight className="size-5" aria-hidden />
          <span className="sr-only">Página siguiente</span>
        </Link>
      ) : (
        <span className={`${arrow} pointer-events-none opacity-30`} aria-hidden>
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}
