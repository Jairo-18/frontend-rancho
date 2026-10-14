import { describe, expect, it } from 'vitest';
import { parseRichText, toPlainText } from './rich-text';

const SAMPLE = `Cabaña Mirador 🌿

Disfruta de una experiencia única en nuestra Cabaña Mirador.

**Incluye los siguientes servicios y amenidades:**

- Jacuzzi con agua caliente, hidromasajes y espuma.
- Baño privado.
- 2 desayunos incluidos.`;

describe('parseRichText', () => {
  it('separa párrafos, negritas y la lista de lo que incluye', () => {
    const blocks = parseRichText(SAMPLE);
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'paragraph', 'paragraph', 'list']);
    expect(blocks[2]).toEqual({
      type: 'paragraph',
      content: [{ text: 'Incluye los siguientes servicios y amenidades:', bold: true }],
    });
    expect(blocks[3]).toEqual({
      type: 'list',
      items: [
        [{ text: 'Jacuzzi con agua caliente, hidromasajes y espuma', bold: false }],
        [{ text: 'Baño privado', bold: false }],
        [{ text: '2 desayunos incluidos', bold: false }],
      ],
    });
  });

  it('una lista pegada a un párrafo (sin línea en blanco) también se reconoce', () => {
    const blocks = parseRichText('Incluye:\n• Wifi\n• Minibar');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'list']);
  });

  it('negrita en medio del texto', () => {
    const [block] = parseRichText('Con **jacuzzi** privado');
    expect(block).toEqual({
      type: 'paragraph',
      content: [
        { text: 'Con ', bold: false },
        { text: 'jacuzzi', bold: true },
        { text: ' privado', bold: false },
      ],
    });
  });
});

describe('toPlainText', () => {
  it('quita asteriscos y viñetas para tarjetas y metadatos', () => {
    const text = toPlainText(SAMPLE);
    expect(text).not.toContain('**');
    expect(text).not.toMatch(/(^|\s)- /);
    expect(text).toContain('Jacuzzi con agua caliente, hidromasajes y espuma, Baño privado, 2 desayunos incluidos.');
  });
});
