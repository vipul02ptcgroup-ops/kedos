import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserAddress = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  pin: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export type UpsertUserAddressInput = Omit<UserAddress, 'id'>;

function addressesCollection(userId: string) {
  if (!db) throw new Error('Firebase is not configured');
  return collection(db, 'users', userId, 'addresses');
}

export function subscribeUserAddresses(userId: string, onData: (addresses: UserAddress[]) => void): Unsubscribe {
  if (!db || !userId) {
    onData([]);
    return () => undefined;
  }

  const q = query(addressesCollection(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data() as Omit<UserAddress, 'id'>;
        return { id: d.id, ...data } as UserAddress;
      });
      onData(rows);
    },
    () => onData([])
  );
}

export async function addUserAddress(userId: string, input: UpsertUserAddressInput): Promise<void> {
  const col = addressesCollection(userId);
  const batch = writeBatch(db!);
  if (input.isDefault) {
    const snap = await getDocs(col);
    snap.docs.forEach((d) => batch.update(d.ref, { isDefault: false, updatedAt: serverTimestamp() }));
  }

  const ref = doc(col);
  batch.set(ref, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function updateUserAddress(userId: string, addressId: string, input: UpsertUserAddressInput): Promise<void> {
  const col = addressesCollection(userId);
  const batch = writeBatch(db!);

  if (input.isDefault) {
    // If setting one as default, unset default on all others.
    const snap = await getDocs(col);
    snap.docs.forEach((d) => batch.update(d.ref, { isDefault: false, updatedAt: serverTimestamp() }));
  }

  const target = doc(col, addressId);
  batch.update(target, {
    ...input,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function setDefaultUserAddress(userId: string, addressId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const col = addressesCollection(userId);
  const batch = writeBatch(db);

  const snap = await getDocs(col);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { isDefault: d.id === addressId, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

export async function deleteUserAddress(userId: string, addressId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
}
