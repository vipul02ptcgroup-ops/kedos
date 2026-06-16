import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, getVariantLabel } from '@/lib/data';

const PRODUCTS_COLLECTION = 'products';

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as T;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, stripUndefinedDeep(v)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

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

export async function fetchProducts(): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeProduct(d.id, d.data()));
}

export function subscribeProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => normalizeProduct(d.id, d.data())));
  });
}

export async function saveProduct(
  product: Omit<Product, 'id'> & { id?: string }
): Promise<string> {
  const { id, ...rest } = product;
  const payload = stripUndefinedDeep({
    ...rest,
    updatedAt: serverTimestamp(),
  });

  if (id) {
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(ref, payload, { merge: true });
    return id;
  }

  const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeProduct(id: string) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}
