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
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

export type CategoryDoc = {
  id: string;
  name: string;
  nameLower: string;
  iconName?: string;
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

export function subscribeCategories(callback: (categories: string[]) => void) {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('nameLower', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs
          .map((d) => String(d.data()?.name || '').trim())
          .filter(Boolean)
      );
    },
    () => callback([])
  );
}

export function subscribeCategoryDocs(callback: (categories: CategoryDoc[]) => void) {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('nameLower', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          name: String(d.data()?.name || '').trim(),
          nameLower: String(d.data()?.nameLower || '').trim(),
          iconName: String(d.data()?.iconName || '').trim() || undefined,
        }))
      );
    },
    () => callback([])
  );
}

export async function createCategory(name: string, iconName?: string) {
  const clean = normalizeName(name);
  if (!clean) return;
  const nameLower = clean.toLowerCase();
  const check = query(collection(db, CATEGORIES_COLLECTION), where('nameLower', '==', nameLower));
  const snap = await getDocs(check);
  if (!snap.empty) return;

  await addDoc(collection(db, CATEGORIES_COLLECTION), {
    name: clean,
    nameLower,
    iconName: String(iconName || '').trim() || 'Tag',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeCategoryByName(name: string) {
  const target = normalizeName(name).toLowerCase();
  if (!target) return;
  const q = query(collection(db, CATEGORIES_COLLECTION), where('nameLower', '==', target));
  const snap = await getDocs(q);
  if (snap.empty) return;
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(collection(db, CATEGORIES_COLLECTION), d.id))));
}

export async function renameCategory(oldName: string, nextName: string, iconName?: string) {
  const oldClean = normalizeName(oldName);
  const nextClean = normalizeName(nextName);
  if (!oldClean || !nextClean) return;
  const oldLower = oldClean.toLowerCase();
  const nextLower = nextClean.toLowerCase();
  const iconClean = String(iconName || '').trim() || 'Tag';

  if (oldLower === nextLower) {
    const sameSnap = await getDocs(
      query(collection(db, CATEGORIES_COLLECTION), where('nameLower', '==', oldLower))
    );
    if (sameSnap.empty) return;
    await Promise.all(
      sameSnap.docs.map((d) =>
        setDoc(
          doc(collection(db, CATEGORIES_COLLECTION), d.id),
          { iconName: iconClean, updatedAt: serverTimestamp() },
          { merge: true }
        )
      )
    );
    return;
  }

  const existsSnap = await getDocs(query(collection(db, CATEGORIES_COLLECTION), where('nameLower', '==', nextLower)));
  if (!existsSnap.empty) throw new Error('Category already exists');

  const oldSnap = await getDocs(
    query(collection(db, CATEGORIES_COLLECTION), where('nameLower', '==', oldClean.toLowerCase()))
  );
  if (oldSnap.empty) throw new Error('Category not found');

  await Promise.all(
    oldSnap.docs.map((d) =>
      setDoc(
        doc(collection(db, CATEGORIES_COLLECTION), d.id),
        { name: nextClean, nameLower: nextLower, iconName: iconClean, updatedAt: serverTimestamp() },
        { merge: true }
      )
    )
  );

  const productsSnap = await getDocs(
    query(collection(db, PRODUCTS_COLLECTION), where('category', '==', oldClean))
  );
  await Promise.all(
    productsSnap.docs.map((p) =>
      setDoc(
        doc(collection(db, PRODUCTS_COLLECTION), p.id),
        { category: nextClean, updatedAt: serverTimestamp() },
        { merge: true }
      )
    )
  );
}
