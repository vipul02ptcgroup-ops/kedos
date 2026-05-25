import {
  Timestamp,
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
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FirestoreOrder } from '@/lib/orders';

export type ProductReview = {
  id: string;
  productId: string;
  userId: string | null;
  userEmail: string;
  name: string;
  rating: number;
  content: string;
  images: string[];
  isGenuine: boolean;
  createdAt: Timestamp | null;
};

async function syncProductRating(productId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const q = query(collection(db, 'reviews'), where('productId', '==', productId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => d.data() as Omit<ProductReview, 'id'>);
  const count = rows.length;
  const avg = count ? rows.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0;
  await setDoc(
    doc(collection(db, 'products'), productId),
    { rating: Number(avg.toFixed(1)), reviews: count, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

function hasPurchasedProduct(orders: FirestoreOrder[], productId: string): boolean {
  return orders.some((o) => (o.items || []).some((it) => String(it.productId || '') === productId));
}

export async function createReview(input: {
  productId: string;
  userId?: string | null;
  userEmail?: string | null;
  name: string;
  rating: number;
  content: string;
  images?: string[];
  orders?: FirestoreOrder[];
}): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const trimmedName = String(input.name || '').trim();
  const trimmedContent = String(input.content || '').trim();
  const rating = Math.max(1, Math.min(5, Number(input.rating || 0)));
  if (!trimmedName) throw new Error('Name is required.');
  if (!trimmedContent) throw new Error('Review content is required.');
  if (!rating) throw new Error('Rating is required.');

  const images = (input.images || []).filter(Boolean).slice(0, 2);
  const isGenuine = Boolean(input.userId && input.orders && hasPurchasedProduct(input.orders, input.productId));

  await addDoc(collection(db, 'reviews'), {
    productId: input.productId,
    userId: input.userId || null,
    userEmail: String(input.userEmail || '').trim(),
    name: trimmedName,
    rating,
    content: trimmedContent,
    images,
    isGenuine,
    createdAt: serverTimestamp(),
  });

  await syncProductRating(input.productId);
}

export function subscribeProductReviews(productId: string, onData: (rows: ProductReview[]) => void): Unsubscribe {
  if (!db || !productId) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'reviews'), where('productId', '==', productId));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductReview, 'id'>) }));
      rows.sort((a, b) => {
        const at = a.createdAt?.toMillis?.() || 0;
        const bt = b.createdAt?.toMillis?.() || 0;
        return bt - at;
      });
      onData(rows);
    },
    () => onData([])
  );
}

export function subscribeAllReviews(onData: (rows: ProductReview[]) => void): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductReview, 'id'>) }))),
    () => onData([])
  );
}

export async function deleteReview(reviewId: string, productId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(collection(db, 'reviews'), reviewId));
  await syncProductRating(productId);
}
