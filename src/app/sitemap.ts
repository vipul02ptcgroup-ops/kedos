import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const publicRoutes = ['/', '/products', '/about', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route === '/' ? '' : route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' || route === '/products' ? 'daily' : 'monthly',
    priority: route === '/' ? 1 : route === '/products' ? 0.9 : 0.7,
  }));
}
