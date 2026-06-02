import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/faq',
          '/products',
          '/shipping-policy',
          '/returns-and-exchanges',
          '/size-guide',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/cart',
          '/cart/',
          '/checkout',
          '/checkout/',
          '/login',
          '/login/',
          '/register',
          '/register/',
          '/profile',
          '/profile/',
          '/wishlist',
          '/wishlist/',
          '/order-success',
          '/order-success/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
