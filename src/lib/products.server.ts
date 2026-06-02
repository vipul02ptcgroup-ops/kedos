import { cache } from 'react';
import { Product } from '@/lib/data';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { toSlug } from '@/lib/slug';

const PRODUCTS_COLLECTION = 'products';

function normalizeProduct(id: string, data: any): Product {
  return {
    id,
    name: data?.name || '',
    price: Number(data?.price || 0),
    originalPrice: data?.originalPrice ? Number(data.originalPrice) : undefined,
    category: data?.category || 'General',
    image: data?.image || '',
    images: Array.isArray(data?.images) ? data.images : undefined,
    rating: Number(data?.rating || 0),
    reviews: Number(data?.reviews || 0),
    badge: data?.badge || undefined,
    description: data?.description || '',
    features: Array.isArray(data?.features) ? data.features : [],
    ageRange: data?.ageRange || '',
    inStock: Boolean(data?.inStock),
    newArrival: Boolean(data?.newArrival),
  };
}

export const fetchProductsForSeo = cache(async (): Promise<Product[]> => {
  try {
    const db = await getAdminDb();
    const snap = await db.collection(PRODUCTS_COLLECTION).orderBy('name', 'asc').get();
    return snap.docs.map((doc) => normalizeProduct(doc.id, doc.data()));
  } catch {
    return [];
  }
});

export async function findProductForSeo(routeKey: string): Promise<Product | null> {
  const cleanRouteKey = String(routeKey || '').trim().toLowerCase();
  if (!cleanRouteKey) return null;

  const products = await fetchProductsForSeo();
  return (
    products.find((product) => {
      return (
        String(product.id).trim().toLowerCase() === cleanRouteKey ||
        toSlug(product.name) === cleanRouteKey
      );
    }) || null
  );
}
