/** Elementos por página en los listados públicos. */
export const PAGE_SIZE = 10;

/** Lee `?pagina=` (texto, lista o nada) y recorta la lista a esa página. */
export function paginate<T>(items: T[], pageParam: string | string[] | undefined, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const requested = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const page = Number.isInteger(requested) && requested >= 1 ? Math.min(requested, totalPages) : 1;
  return { page, totalPages, items: items.slice((page - 1) * size, page * size) };
}
