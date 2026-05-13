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
import { Product } from '@/lib/data';

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
  const payload = {
    ...rest,
    updatedAt: serverTimestamp(),
  };

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
