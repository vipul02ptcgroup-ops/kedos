import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type AdminLogEntry = {
  id: string;
  action: string;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  targetUid: string;
  targetEmail: string;
  details: string;
  createdAt?: any;
};

type CreateAdminLogParams = {
  action: string;
  actorUid?: string;
  actorEmail?: string;
  actorName?: string;
  targetUid?: string;
  targetEmail?: string;
  details?: string;
};

export async function createAdminLog(params: CreateAdminLogParams): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'admin_logs'), {
    action: String(params.action || '').trim(),
    actorUid: String(params.actorUid || '').trim(),
    actorEmail: String(params.actorEmail || '').trim(),
    actorName: String(params.actorName || '').trim(),
    targetUid: String(params.targetUid || '').trim(),
    targetEmail: String(params.targetEmail || '').trim(),
    details: String(params.details || '').trim(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeAdminLogs(
  onData: (rows: AdminLogEntry[]) => void,
  maxRows = 300
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => {};
  }

  const q = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(maxRows));
  return onSnapshot(q, (snap) => {
    const rows: AdminLogEntry[] = snap.docs.map((d) => {
      const data: any = d.data() || {};
      return {
        id: d.id,
        action: String(data.action || ''),
        actorUid: String(data.actorUid || ''),
        actorEmail: String(data.actorEmail || ''),
        actorName: String(data.actorName || ''),
        targetUid: String(data.targetUid || ''),
        targetEmail: String(data.targetEmail || ''),
        details: String(data.details || ''),
        createdAt: data.createdAt,
      };
    });
    onData(rows);
  });
}

export function getAdminActorSnapshot() {
  const user = auth?.currentUser;
  return {
    actorUid: String(user?.uid || '').trim(),
    actorEmail: String(user?.email || '').trim(),
    actorName: String(user?.displayName || '').trim(),
  };
}
