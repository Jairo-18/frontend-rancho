# frontend-rancho

Sitio público y panel `/admin` del Hotel Rancho Ecológico: Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4.

## Puesta en marcha

```bash
cp .env.example .env.development
pnpm install
pnpm dev     # http://localhost:3000 (backend en http://localhost:4000)
```

| Variable | Descripción |
|---|---|
| `API_URL` | Backend visto desde el servidor de Next (páginas y proxy `/api/v1`). Variable de **ejecución**. |
| `MEDIA_URL` | Origen público de las fotos (= `APP_BASE_URL` del backend); autoriza a `next/image`. |
| `SITE_URL` | URL pública del sitio (metadata, Open Graph, sitemap). |

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `start` | Compilar (no necesita el backend) y servir |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests (Vitest): generador del mensaje de WhatsApp, formatos y validaciones del panel |

## Cómo está armado

- **Datos**: `src/lib/api.ts` (solo servidor) con `use cache` + `cacheLife('minutes')`; las páginas lo llaman tras `connection()` dentro de `<Suspense>`, así el build no consulta el backend.
- **Navegador → backend**: proxy `src/app/api/v1/[...path]/route.ts` (sin CORS, sin `NEXT_PUBLIC_*`). Tras cada cambio del panel invalida la caché del sitio.
- **Panel admin**: sesión en cookies httpOnly (`src/app/api/session`, `src/lib/session.ts`), `src/proxy.ts` protege `/admin`, páginas en `src/app/admin/(panel)` y componentes en `src/components/admin`.
- **Mi solicitud**: `src/lib/request-store.ts` (estado del navegador + `localStorage`) y `src/lib/whatsapp.ts` (mensaje y enlace `wa.me`). Nada se guarda en el backend.
- **Diseño**: tokens de la paleta, fuentes y texturas en `src/app/globals.css`; ilustraciones SVG en `src/components/decor.tsx` y `hero-landscape.tsx`.

## Páginas

`/` · `/cabanas` · `/cabanas/[slug]` (galería + calculadora) · `/cabalgatas` · `/productos` · `/contacto` · `/solicitud` · `sitemap.xml` · `robots.txt`

Panel: `/admin/login` · `/admin` · `/admin/cabanas` · `/admin/reglas-precio` · `/admin/cabalgatas` · `/admin/productos` · `/admin/ajustes`
