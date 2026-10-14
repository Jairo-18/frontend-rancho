import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { getHorsebackRides, getProducts, getRooms } from '@/lib/api';

const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const pages = ['', '/cabanas', '/cabalgatas', '/productos', '/contacto'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
  try {
    const [rooms, rides, products] = await Promise.all([getRooms(), getHorsebackRides(), getProducts()]);
    const detail = (path: string, priority: number) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'weekly' as const,
      priority,
    });
    return [
      ...pages,
      ...rooms.map((room) => detail(`/cabanas/${room.slug}`, 0.9)),
      ...rides.map((ride) => detail(`/cabalgatas/${ride.slug}`, 0.7)),
      ...products.map((product) => detail(`/productos/${product.slug}`, 0.6)),
    ];
  } catch {
    // Sin backend el sitemap sigue sirviendo las páginas fijas.
    return pages;
  }
}
