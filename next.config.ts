import type { NextConfig } from 'next';

/**
 * Fotos: las sirve el backend en `<MEDIA_URL>/uploads/...`. Se lee al arrancar
 * `next start` (el Dockerfile copia este archivo a la imagen), así que basta
 * con la variable de entorno del contenedor.
 */
function uploadsPattern(): URL[] {
  const media = process.env.MEDIA_URL?.replace(/\/+$/, '');
  if (!media) return [];
  try {
    return [new URL(`${media}/uploads/**`)];
  } catch {
    console.warn(`MEDIA_URL no es una URL válida: ${media}`);
    return [];
  }
}

function isLocalMedia(): boolean {
  try {
    const { hostname } = new URL(process.env.MEDIA_URL ?? '');
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    remotePatterns: uploadsPattern(),
    // El backend ya entrega WebP ≤ 1920 px; Next genera los tamaños por pantalla.
    formats: ['image/avif', 'image/webp'],
    // En local el backend vive en localhost (IP privada) y el optimizador la
    // bloquea por defecto: solo se permite cuando MEDIA_URL es local.
    dangerouslyAllowLocalIP: isLocalMedia(),
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
