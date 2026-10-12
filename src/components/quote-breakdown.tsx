import { CalendarDays, Sparkles, Sun } from 'lucide-react';
import { formatDate, formatMoney, NIGHT_TYPE_LABEL } from '@/lib/format';
import type { NightType, Quote } from '@/lib/types';

const TYPE_STYLE: Record<NightType, { className: string; Icon: typeof Sun }> = {
  WEEKDAY: { className: 'text-musgo-700', Icon: CalendarDays },
  WEEKEND: { className: 'text-arcilla-700', Icon: Sun },
  SPECIAL: { className: 'text-madera', Icon: Sparkles },
};

/** Desglose noche por noche: fecha, tipo de tarifa y precio. */
export function QuoteBreakdown({ quote }: { quote: Quote }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Precio por noche de {quote.roomName}</caption>
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-tinta-suave">
          <th scope="col" className="pb-2 font-bold">Noche</th>
          <th scope="col" className="pb-2 font-bold">Tarifa</th>
          <th scope="col" className="pb-2 text-right font-bold">Precio</th>
        </tr>
      </thead>
      <tbody>
        {quote.nights.map((night) => {
          const { className, Icon } = TYPE_STYLE[night.type];
          return (
            <tr key={night.date} className="border-t border-dashed border-madera/20">
              <td className="py-2.5 pr-2 font-semibold whitespace-nowrap">{formatDate(night.date)}</td>
              <td className={`py-2.5 pr-2 ${className}`}>
                <span className="inline-flex items-center gap-1 font-bold">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {night.rule ? night.rule.name : NIGHT_TYPE_LABEL[night.type]}
                </span>
                {night.type === 'SPECIAL' && night.price !== night.basePrice && (
                  <span className="block text-xs text-tinta-suave">
                    Normal: {formatMoney(night.basePrice)}
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right font-bold tabular-nums">{formatMoney(night.price)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
