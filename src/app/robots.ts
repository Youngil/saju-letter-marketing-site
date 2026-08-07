import type { MetadataRoute } from 'next';

const WEB_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'http://localhost:3200';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${WEB_BASE_URL}/sitemap.xml`,
  };
}
