import { Check } from 'lucide-react';
import { type Inline, parseRichText } from '@/lib/rich-text';

function InlineText({ parts }: { parts: Inline[] }) {
  return parts.map((part, i) =>
    part.bold ? (
      <strong key={i} className="font-bold text-tinta">
        {part.text}
      </strong>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}

/**
 * Descripción con formato sencillo (ver `lib/rich-text`): párrafos, negritas y
 * listas. Las listas ("Incluye…") se muestran como etiquetas en línea, que se
 * leen de un vistazo.
 */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {parseRichText(text).map((block, i) =>
        block.type === 'paragraph' ? (
          <p key={i}>
            <InlineText parts={block.content} />
          </p>
        ) : (
          <ul key={i} className="flex flex-wrap gap-2">
            {block.items.map((item, j) => (
              <li
                key={j}
                className="inline-flex items-center gap-1.5 rounded-full border border-musgo-700/20 bg-musgo/10 px-3 py-1.5 text-[0.95rem] leading-snug text-tinta"
              >
                <Check className="size-4 shrink-0 text-musgo-700" aria-hidden />
                <span>
                  <InlineText parts={item} />
                </span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
