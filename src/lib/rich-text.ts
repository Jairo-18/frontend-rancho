/**
 * Formato sencillo para las descripciones que escribe el dueño en el panel:
 * - párrafos separados por línea en blanco;
 * - `**texto**` en negrita;
 * - líneas que empiezan con "-", "•" o "*" forman una lista (p. ej. "Incluye").
 * Nada de HTML: el texto se pinta como texto (sin riesgo de inyección).
 */

export type Inline = { text: string; bold: boolean };
export type Block = { type: 'paragraph'; content: Inline[] } | { type: 'list'; items: Inline[][] };

const BULLET = /^\s*[-•*]\s+/;

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts.filter((part) => part.text !== '');
}

export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list.map(parseInline) });
    list = [];
  };

  for (const rawLine of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (line === '') {
      flushParagraph();
      flushList();
    } else if (BULLET.test(line)) {
      flushParagraph();
      // "Jacuzzi con agua caliente." → sin el punto final, se lee mejor como etiqueta.
      list.push(line.replace(BULLET, '').replace(/[.;,]\s*$/, ''));
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Texto plano (para tarjetas y metadatos): sin asteriscos ni viñetas. */
export function toPlainText(source: string): string {
  return parseRichText(source)
    .map((block) =>
      block.type === 'paragraph'
        ? block.content.map((part) => part.text).join('')
        : block.items.map((item) => item.map((part) => part.text).join('')).join(', ') + '.',
    )
    .join(' ');
}
