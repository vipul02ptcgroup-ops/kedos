import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  deleteDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase';

export type WishlistItemDoc = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
};

export type WishlistAdminSummary = {
  productId: string;
  totalAdds: number;
  users: Array<{ userId: string; email: string; name: string }>;
};

const WISHLIST_COLLECTION = 'wishlistItems';

function wishlistDocId(userId: string, productId: string) {
  return `${userId}_${productId}`;
}

export function subscribeUserWishlistProductIds(
  userId: string | null | undefined,
  callback: (productIds: string[]) => void
) {
  if (!db || !userId) {
    callback([]);
    return () => undefined;
  }

  const q = query(collection(db, WISHLIST_COLLECTION), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => String(d.data()?.productId || '')).filter(Boolean)),
    () => callback([])
  );
}

export async function addToWishlist(user: User, productId: string) {
  if (!db) throw new Error('Firebase is not initialized.');
  const id = wishlistDocId(user.uid, productId);
  await setDoc(doc(db, WISHLIST_COLLECTION, id), {
    userId: user.uid,
    userEmail: user.email || '',
    userName: user.displayName || '',
    productId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!db) throw new Error('Firebase is not initialized.');
  await deleteDoc(doc(db, WISHLIST_COLLECTION, wishlistDocId(userId, productId)));
}

export async function toggleWishlist(user: User, productId: string, isWishlisted: boolean) {
  if (isWishlisted) {
    await removeFromWishlist(user.uid, productId);
    return false;
  }
  await addToWishlist(user, productId);
  return true;
}

export function subscribeWishlistItems(callback: (items: WishlistItemDoc[]) => void) {
  if (!db) {
    callback([]);
    return () => undefined;
  }

  return onSnapshot(
    collection(db, WISHLIST_COLLECTION),
    (snap) => {
      callback(
        snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: String(data?.userId || ''),
            userEmail: String(data?.userEmail || ''),
            userName: String(data?.userName || ''),
            productId: String(data?.productId || ''),
          };
        }).filter((row) => row.userId && row.productId)
      );
    },
    () => callback([])
  );
}

export function summarizeWishlist(items: WishlistItemDoc[]): WishlistAdminSummary[] {
  const map = new Map<string, WishlistAdminSummary>();

  items.forEach((item) => {
    const existing = map.get(item.productId);
    if (!existing) {
      map.set(item.productId, {
        productId: item.productId,
        totalAdds: 1,
        users: [{ userId: item.userId, email: item.userEmail, name: item.userName }],
      });
      return;
    }

    existing.totalAdds += 1;
    if (!existing.users.some((u) => u.userId === item.userId)) {
      existing.users.push({ userId: item.userId, email: item.userEmail, name: item.userName });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.totalAdds - a.totalAdds);
}
