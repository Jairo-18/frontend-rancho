# Sitio público + panel admin del Rancho Porvenir (Next.js) para Dokploy.
FROM node:24-alpine AS base
WORKDIR /app
# Versión fijada, como en samawe.
RUN npm install -g pnpm@10

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
# El build NO necesita el backend: las páginas leen la API al atender cada
# visita (API_URL es variable de ejecución, no de build).
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
# API_URL y SITE_URL: variables de entorno del contenedor (ver .env.example).
CMD ["pnpm", "start"]
