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
  void upsertUserProfile({ user: credential.user, name: params.name, phone: params.phone }).catch((err) => {
    console.warn('Profile sync failed after register:', err);
  });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  assertFirebaseReady();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  void upsertUserProfile({ user: credential.user }).catch((err) => {
    console.warn('Profile sync failed after login:', err);
  });
  return credential.user;
}

export async function continueWithGoogle() {
  assertFirebaseReady();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  void upsertUserProfile({ user: credential.user }).catch((err) => {
    console.warn('Profile sync failed after Google sign-in:', err);
  });
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

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function logoutUser() {
  await signOut(auth);
}
