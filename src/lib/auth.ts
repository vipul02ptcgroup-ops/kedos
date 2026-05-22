import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'customer' | 'admin';
export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
};

type UpsertUserParams = {
  user: User;
  name?: string;
  phone?: string;
};

function assertFirebaseReady() {
  if (!auth || !db) {
    throw new Error('Firebase is not initialized. Check NEXT_PUBLIC_FIREBASE_* env values and restart dev server.');
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 7000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out.')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function upsertUserProfile({ user, name, phone }: UpsertUserParams) {
  assertFirebaseReady();
  const userRef = doc(db, 'users', user.uid);
  const snap = await withTimeout(getDoc(userRef));
  const existingRole = (snap.exists() ? snap.data().role : null) as UserRole | null;

  await withTimeout(
    setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        name: name || user.displayName || '',
        phone: phone || user.phoneNumber || '',
        role: existingRole || 'customer',
        updatedAt: serverTimestamp(),
        createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
      },
      { merge: true }
    )
  );
}

export async function registerWithEmail(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  assertFirebaseReady();
  const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
  if (params.name) {
    await updateProfile(credential.user, { displayName: params.name });
  }
  await upsertUserProfile({ user: credential.user, name: params.name, phone: params.phone });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  assertFirebaseReady();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile({ user: credential.user });
  return credential.user;
}

export async function continueWithGoogle() {
  assertFirebaseReady();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  await upsertUserProfile({ user: credential.user });
  return credential.user;
}

export async function getUserRole(uid: string): Promise<UserRole> {
  assertFirebaseReady();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 'customer';
  return (snap.data().role as UserRole) || 'customer';
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  assertFirebaseReady();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: String(data.email || ''),
    name: String(data.name || ''),
    phone: String(data.phone || ''),
    role: (data.role as UserRole) || 'customer',
  };
}

export async function updateUserSettings(params: {
  user: User;
  name: string;
  phone: string;
}): Promise<void> {
  assertFirebaseReady();
  const cleanName = params.name.trim();
  const cleanPhone = params.phone.trim();

  if (cleanName && cleanName !== (params.user.displayName || '').trim()) {
    await updateProfile(params.user, { displayName: cleanName });
  }

  await upsertUserProfile({
    user: params.user,
    name: cleanName,
    phone: cleanPhone,
  });
}

export function subscribeAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user && db) {
      // Self-heal missing users/{uid} document for role-based flows.
      void upsertUserProfile({ user }).catch((err) => {
        console.warn('Profile sync failed on auth state change:', err);
      });
    }
    callback(user);
  });
}

export async function logoutUser() {
  assertFirebaseReady();
  await signOut(auth);
}
