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
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ContactMessageStatus = 'new' | 'in_progress' | 'resolved';

export type ContactMessage = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  adminReply: string;
  hasReply: boolean;
  repliedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export async function createContactMessage(input: {
  userId?: string | null;
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await addDoc(collection(db, 'contactMessages'), {
    userId: input.userId || null,
    name: input.name.trim(),
    email: input.email.trim(),
    subject: String(input.subject || '').trim(),
    message: input.message.trim(),
    status: 'new' as ContactMessageStatus,
    adminReply: '',
    hasReply: false,
    repliedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeContactMessages(onData: (messages: ContactMessage[]) => void): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }));
      onData(rows);
    },
    () => onData([])
  );
}

export async function updateContactMessage(
  id: string,
  updates: Partial<Pick<ContactMessage, 'status' | 'adminReply' | 'hasReply' | 'repliedAt'>>
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await updateDoc(doc(collection(db, 'contactMessages'), id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function replyToContactMessage(
  id: string,
  params: { reply: string; status?: ContactMessageStatus }
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await updateDoc(doc(collection(db, 'contactMessages'), id), {
    adminReply: params.reply.trim(),
    hasReply: Boolean(params.reply.trim()),
    repliedAt: params.reply.trim() ? serverTimestamp() : null,
    ...(params.status ? { status: params.status } : {}),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeUserContactMessages(
  params: { userId?: string | null; email?: string | null },
  onData: (messages: ContactMessage[]) => void
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const userId = String(params.userId || '').trim();
  const email = String(params.email || '').trim().toLowerCase();
  if (!userId && !email) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) }))
        .filter((row) => {
          const rowUserId = String(row.userId || '').trim();
          const rowEmail = String(row.email || '').trim().toLowerCase();
          return (userId && rowUserId === userId) || (email && rowEmail === email);
        });
      onData(rows);
    },
    () => onData([])
  );
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await deleteDoc(doc(collection(db, 'contactMessages'), id));
}
