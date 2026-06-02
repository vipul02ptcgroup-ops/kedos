import type { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { SITE_URL } from '@/lib/seo';
import { getProductSlug, toSlug } from '@/lib/slug';

type SitemapFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

type StaticRouteConfig = {
  path: string;
  changeFrequency: SitemapFrequency;
  priority: number;
};

type ProductSitemapEntry = {
  slug: string;
  lastModified?: Date;
};

type CategorySitemapEntry = {
  name: string;
  lastModified?: Date;
};

const STATIC_ROUTES: StaticRouteConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/products', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/shipping-policy', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/returns-and-exchanges', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/size-guide', changeFrequency: 'monthly', priority: 0.5 },
];

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null) {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === 'function') {
      try {
        return maybeTimestamp.toDate();
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

function absoluteUrl(path: string) {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

async function fetchProductEntries(): Promise<ProductSitemapEntry[]> {
  try {
    const db = await getAdminDb();
    const snapshot = await db.collection('products').orderBy('name', 'asc').get();

    const entries = snapshot.docs
      .map((doc): ProductSitemapEntry | null => {
        const data = doc.data();
        const name = String(data?.name || '').trim();
        if (!name) return null;

        return {
          slug: getProductSlug({ id: doc.id, name }),
          lastModified: asDate(data?.updatedAt) || asDate(data?.createdAt),
        };
      })
      .filter((entry): entry is ProductSitemapEntry => entry !== null);

    return entries;
  } catch {
    return [];
  }
}

async function fetchCategoryEntries(): Promise<CategorySitemapEntry[]> {
  try {
    const db = await getAdminDb();
    const [categorySnapshot, productSnapshot] = await Promise.all([
      db.collection('categories').orderBy('nameLower', 'asc').get(),
      db.collection('products').select('category', 'updatedAt', 'createdAt').get(),
    ]);

    const categoryMap = new Map<string, CategorySitemapEntry>();

    for (const doc of categorySnapshot.docs) {
      const data = doc.data();
      const name = String(data?.name || '').trim();
      if (!name) continue;
      categoryMap.set(name.toLowerCase(), {
        name,
        lastModified: asDate(data?.updatedAt) || asDate(data?.createdAt),
      });
    }

    for (const doc of productSnapshot.docs) {
      const data = doc.data();
      const name = String(data?.category || '').trim();
      if (!name) continue;

      const key = name.toLowerCase();
      const productUpdated = asDate(data?.updatedAt) || asDate(data?.createdAt);
      const existing = categoryMap.get(key);

      if (!existing) {
        categoryMap.set(key, { name, lastModified: productUpdated });
        continue;
      }

      if (
        productUpdated &&
        (!existing.lastModified || productUpdated.getTime() > existing.lastModified.getTime())
      ) {
        existing.lastModified = productUpdated;
      }
    }

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();
  const [products, categories] = await Promise.all([
    fetchProductEntries(),
    fetchCategoryEntries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: generatedAt,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/products/${product.slug}`),
    lastModified: product.lastModified || generatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/products?category=${encodeURIComponent(toSlug(category.name))}`),
    lastModified: category.lastModified || generatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
