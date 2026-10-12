import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getRooms } from '@/lib/api';

const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const pages = ['', '/cabanas', '/cabalgatas', '/productos', '/contacto'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  try {
    const rooms = await getRooms();
    return [
      ...pages,
      ...rooms.map((room) => ({
        url: `${SITE_URL}/cabanas/${room.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
    ];
  } catch {
    // Sin backend el sitemap sigue sirviendo las páginas fijas.
    return pages;
  }
}
