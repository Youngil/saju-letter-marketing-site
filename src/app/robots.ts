import type { MetadataRoute } from 'next';
import { WEB_BASE_URL } from '@/lib/seo';


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${WEB_BASE_URL}/sitemap.xml`,
  };
}
