import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { siteUrl } from '@/lib/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/solicitud'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
