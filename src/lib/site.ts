/**
 * URL pública del sitio, sin "/" final. Se lee en cada petición (variable de
 * ejecución en Dokploy): leída a nivel de módulo quedaba congelada al compilar
 * la imagen de Docker (canonical y og:url apuntaban a localhost).
 */
export function siteUrl(): string {
  return (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
}

export const SITE_NAME = 'Rancho Porvenir';
