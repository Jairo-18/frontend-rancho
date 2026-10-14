'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAdmin } from '@/components/admin/admin-shell';
import {
  EmptyBlock,
  ErrorBlock,
  inputClass,
  ListToolbar,
  LoadingBlock,
  NewButton,
  PageHeader,
  StatusBadge,
  AdminPager,
} from '@/components/admin/ui';
import { paginate } from '@/lib/paginate';
import { formatDate, formatMoney, todayInBogota } from '@/lib/format';
import type { PriceRule, StatusFilter } from '@/lib/types';
import { useAdminData } from '@/lib/use-admin-data';
import { useDebounced } from '@/lib/use-debounced';

function ruleValue(rule: PriceRule): string {
  if (rule.type === 'FIXED') return `${formatMoney(rule.value)} fijo`;
  return `${rule.value > 0 ? '+' : ''}${rule.value} %`;
}

export default function PriceRulesPage() {
  const { roomLabel } = useAdmin();
  const currentYear = Number(todayInBogota().slice(0, 4));
  const [year, setYear] = useState(String(currentYear));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search.trim());
  const query = new URLSearchParams({ status, ...(year && { year }), ...(debounced && { search: debounced }) });
  const rules = useAdminData<PriceRule[]>(`price-rules?${query}`);

  return (
    <>
      <PageHeader
        title="Precios y festivos"
        description="Reglas por fechas: festivos, puentes y temporadas. Ganan sobre el precio entre semana y de fin de semana."
        action={<NewButton href="/admin/reglas-precio/nueva">Nueva regla</NewButton>}
      />
      <div className="mb-3 sm:max-w-48">
        <label htmlFor="pr-year" className="text-sm font-bold">
          Año
        </label>
        <select
          id="pr-year"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
          <option value="">Todos</option>
        </select>
      </div>
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

      {rules.status === 'loading' && <LoadingBlock />}
      {rules.status === 'error' && <ErrorBlock message={rules.error} onRetry={rules.reload} />}
      {rules.status === 'ready' && rules.data.length === 0 && (
        <EmptyBlock title="No hay reglas con ese filtro">Crea una para un festivo o una temporada.</EmptyBlock>
      )}
      {rules.status === 'ready' && rules.data.length > 0 && (
        <ul className="divide-y divide-bosque/10 overflow-hidden rounded-2xl border border-bosque/15 bg-papel-claro shadow-calida">
          {paginate(rules.data, String(page)).items.map((rule) => (
            <li key={rule.id}>
              <Link
                href={`/admin/reglas-precio/${rule.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-arena/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg text-bosque">{rule.name}</span>
                    <StatusBadge active={rule.isActive} />
                  </span>
                  <span className="mt-0.5 block text-sm text-tinta-suave">
                    {rule.startDate === rule.endDate
                      ? `Noche del ${formatDate(rule.startDate)}`
                      : `${formatDate(rule.startDate)} → ${formatDate(rule.endDate)}`}
                    {' · '}
                    {rule.roomName ?? `Todas las ${roomLabel.toLowerCase()}`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-bold text-madera-900">{ruleValue(rule)}</span>
                  <span className="text-xs text-tinta-suave">prioridad {rule.priority}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-tinta-suave" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rules.status === 'ready' && (
        <AdminPager
          page={paginate(rules.data, String(page)).page}
          totalPages={paginate(rules.data, String(page)).totalPages}
          total={rules.data.length}
          onPage={setPage}
        />
      )}
    </>
  );
}
