import { Fragment, type ReactNode } from 'react';
import { WhatsAppIcon } from './brand-icons';

/** Aplica *negrita* y _cursiva_ como lo hace WhatsApp (sin anidar). */
function formatInline(text: string): ReactNode[] {
  return text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) => {
    if (/^\*[^*]+\*$/.test(part)) return <strong key={i}>{part.slice(1, -1)}</strong>;
    if (/^_[^_]+_$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * Vista previa del mensaje tal como lo verá el hotel en WhatsApp: burbuja de
 * chat sobre el fondo del chat, con el formato ya aplicado.
 */
export function WhatsAppPreview({ message, hotelName }: { message: string; hotelName: string }) {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-organico)] shadow-calida">
      <figcaption className="flex items-center gap-3 bg-[#1f4d3a] px-4 py-3 text-papel-claro">
        <span className="grid size-9 place-items-center rounded-full bg-[#1f7a43]">
          <WhatsAppIcon className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block font-bold">{hotelName}</span>
          <span className="text-xs text-papel/75">Así le llega tu mensaje</span>
        </span>
      </figcaption>
      <div className="bg-[#ece5dd] px-3 py-4">
        <div className="relative ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3.5 py-2.5 text-[0.9rem] leading-snug text-[#111b21] shadow-sm">
          {message.split('\n').map((line, i) =>
            line === '' ? (
              <div key={i} className="h-2" />
            ) : line.startsWith('- ') ? (
              <p key={i} className="flex gap-2 pl-1">
                <span aria-hidden>•</span>
                <span>{formatInline(line.slice(2))}</span>
              </p>
            ) : (
              <p key={i} className={/^━+$/.test(line) ? 'overflow-hidden whitespace-nowrap text-[#111b21]/40' : ''}>
                {formatInline(line)}
              </p>
            ),
          )}
          <p className="mt-1 text-right text-[0.68rem] text-[#111b21]/50" aria-hidden>
            ahora ✓✓
          </p>
        </div>
      </div>
    </figure>
  );
}
