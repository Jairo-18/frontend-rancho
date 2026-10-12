import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/solicitud'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
