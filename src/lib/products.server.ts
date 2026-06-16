import { cache } from 'react';
import { Product, getVariantLabel } from '@/lib/data';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { toSlug } from '@/lib/slug';

const PRODUCTS_COLLECTION = 'products';

function normalizeProduct(id: string, data: any): Product {
  const variants = Array.isArray(data?.variants)
    ? data.variants
        .map((variant: any, index: number) => {
          const variantId = String(variant?.id || '').trim() || `variant-${index + 1}`;
          const color = String(variant?.color || '').trim() || undefined;
          const size = String(variant?.size || '').trim() || undefined;
          const label = getVariantLabel({
            label: String(variant?.label || '').trim(),
            color,
            size,
          });
          const image = String(variant?.image || '').trim();
          const images = Array.isArray(variant?.images)
            ? variant.images.map((item: unknown) => String(item || '').trim()).filter(Boolean)
            : undefined;
          return {
            id: variantId,
            label: label || variantId,
            color,
            size,
            price: Number(variant?.price || 0),
            originalPrice: variant?.originalPrice ? Number(variant.originalPrice) : undefined,
            image: image || images?.[0] || String(data?.image || ''),
            images,
            inStock: Boolean(variant?.inStock),
          };
        })
        .filter((variant: { image: string }) => variant.image)
    : undefined;

  const defaultVariant = variants?.find((variant: { inStock: boolean }) => variant.inStock) || variants?.[0];

  return {
    id,
    name: data?.name || '',
    price: Number(defaultVariant?.price ?? data?.price ?? 0),
    originalPrice: defaultVariant?.originalPrice ?? (data?.originalPrice ? Number(data.originalPrice) : undefined),
    category: data?.category || 'General',
    image: defaultVariant?.image || data?.image || '',
    images: defaultVariant?.images?.length ? defaultVariant.images : Array.isArray(data?.images) ? data.images : undefined,
    rating: Number(data?.rating || 0),
    reviews: Number(data?.reviews || 0),
    badge: data?.badge || undefined,
    description: data?.description || '',
    features: Array.isArray(data?.features) ? data.features : [],
    ageRange: data?.ageRange || '',
    inStock: defaultVariant ? variants?.some((variant: { inStock: boolean }) => variant.inStock) ?? false : Boolean(data?.inStock),
    newArrival: Boolean(data?.newArrival),
    variants,
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
