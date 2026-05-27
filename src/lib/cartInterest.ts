import {
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase';

export type CartInterestDoc = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  addCount: number;
};

export type CartInterestAdminSummary = {
  productId: string;
  totalAdds: number;
  users: Array<{ userId: string; email: string; name: string; addCount: number }>;
};

const CART_INTEREST_COLLECTION = 'cartInterestItems';

function cartInterestDocId(userId: string, productId: string) {
  return `${userId}_${productId}`;
}

export async function trackCartInterest(user: User | null, productId: string, quantity = 1) {
  if (!db || !user || !user.uid || !productId || quantity < 1) return;
  const id = cartInterestDocId(user.uid, productId);
  await setDoc(
    doc(db, CART_INTEREST_COLLECTION, id),
    {
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || '',
      productId,
      addCount: increment(quantity),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeCartInterestItems(callback: (items: CartInterestDoc[]) => void) {
  if (!db) {
    callback([]);
    return () => undefined;
  }

  return onSnapshot(
    collection(db, CART_INTEREST_COLLECTION),
    (snap) => {
      callback(
        snap.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              userId: String(data?.userId || ''),
              userEmail: String(data?.userEmail || ''),
              userName: String(data?.userName || ''),
              productId: String(data?.productId || ''),
              addCount: Number(data?.addCount || 0),
            };
          })
          .filter((row) => row.userId && row.productId)
      );
    },
    () => callback([])
  );
}

export function summarizeCartInterest(items: CartInterestDoc[]): CartInterestAdminSummary[] {
  const map = new Map<string, CartInterestAdminSummary>();

  items.forEach((item) => {
    const existing = map.get(item.productId);
    if (!existing) {
      map.set(item.productId, {
        productId: item.productId,
        totalAdds: item.addCount || 0,
        users: [
          {
            userId: item.userId,
            email: item.userEmail,
            name: item.userName,
            addCount: item.addCount || 0,
          },
        ],
      });
      return;
    }

    existing.totalAdds += item.addCount || 0;
    existing.users.push({
      userId: item.userId,
      email: item.userEmail,
      name: item.userName,
      addCount: item.addCount || 0,
    });
  });

  return Array.from(map.values()).sort((a, b) => b.totalAdds - a.totalAdds);
}
