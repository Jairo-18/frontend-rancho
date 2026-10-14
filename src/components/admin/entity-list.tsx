'use client';

import { ChevronRight, ImageOff } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import type { StatusFilter } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { useDebounced } from '@/lib/use-debounced';
import { paginate } from '@/lib/paginate';
import { AdminPager, EmptyBlock, ErrorBlock, ListToolbar, LoadingBlock, StatusBadge } from './ui';

interface ListItem {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Listado del panel con búsqueda y filtro activo/inactivo (CONTEXT §6.2).
 * En el celular cada ítem es una tarjeta táctil; en escritorio, una fila.
 */
export function EntityList<T extends ListItem>({
  apiPath,
  editPath,
  emptyTitle,
  emptyHint,
  thumbnail,
  meta,
  searchable = true,
}: {
  /** Ruta de la API sin query, p. ej. "rooms/admin". */
  apiPath: string;
  editPath: (item: T) => string;
  emptyTitle: string;
  emptyHint?: ReactNode;
  thumbnail?: (item: T) => string | null;
  /** Información extra bajo el nombre (precios, fechas…). */
  meta: (item: T) => ReactNode;
  searchable?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search.trim());
  const query = new URLSearchParams({ status, ...(debounced && { search: debounced }) });
  const list = useAdminData<T[]>(`${apiPath}?${query}`);

  return (
    <div>
      {searchable && (
        <ListToolbar
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          status={status}
          onStatus={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
      )}
      {list.status === 'loading' && <LoadingBlock />}
      {list.status === 'error' && <ErrorBlock message={list.error} onRetry={list.reload} />}
      {list.status === 'ready' && list.data.length === 0 && (
        <EmptyBlock title={debounced || status !== 'all' ? 'No hay resultados con ese filtro' : emptyTitle}>
          {!debounced && status === 'all' && emptyHint}
        </EmptyBlock>
      )}
      {list.status === 'ready' && list.data.length > 0 && (
        <ul className="divide-y divide-bosque/10 overflow-hidden rounded-2xl border border-bosque/15 bg-papel-claro shadow-calida">
          {paginate(list.data, String(page)).items.map((item) => {
            const src = thumbnail?.(item);
            return (
              <li key={item.id}>
                <Link
                  href={editPath(item)}
                  className="flex items-center gap-3 px-3 py-3 transition hover:bg-arena/40 sm:gap-4 sm:px-4"
                >
                  {thumbnail && (
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-arena">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniaturas del panel
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff className="absolute inset-0 m-auto size-6 text-madera/50" aria-hidden />
                      )}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-display text-lg text-bosque">{item.name}</span>
                      <StatusBadge active={item.isActive} />
                    </span>
                    <span className="mt-0.5 block text-sm text-tinta-suave">{meta(item)}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {list.status === 'ready' && (
        <AdminPager
          page={paginate(list.data, String(page)).page}
          totalPages={paginate(list.data, String(page)).totalPages}
          total={list.data.length}
          onPage={setPage}
        />
      )}
      <p className="sr-only" aria-live="polite">
        {list.status === 'ready' ? `${list.data.length} resultados` : ''}
      </p>
    </div>
  );
}
