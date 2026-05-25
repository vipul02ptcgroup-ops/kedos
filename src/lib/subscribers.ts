import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Subscriber = {
  id: string;
  email: string;
  emailLower: string;
  createdAt: Timestamp | null;
};

export async function subscribeEmail(email: string): Promise<{ created: boolean }> {
  if (!db) throw new Error('Firebase is not configured');
  const cleanEmail = String(email || '').trim();
  const emailLower = cleanEmail.toLowerCase();
  if (!cleanEmail) throw new Error('Email is required.');

  const dupQ = query(collection(db, 'subscribers'), where('emailLower', '==', emailLower));
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) return { created: false };

  await addDoc(collection(db, 'subscribers'), {
    email: cleanEmail,
    emailLower,
    createdAt: serverTimestamp(),
  });
  return { created: true };
}

export function subscribeSubscribers(onData: (rows: Subscriber[]) => void): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'subscribers'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Subscriber, 'id'>) }));
      onData(rows);
    },
    () => onData([])
  );
}

export async function deleteSubscriber(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(collection(db, 'subscribers'), id));
}

