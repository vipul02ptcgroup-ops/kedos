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
import { auth, db, firebaseClientInitError } from '@/lib/firebase';

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
    throw new Error(
      firebaseClientInitError ||
        'Firebase is not initialized. Check NEXT_PUBLIC_FIREBASE_* env values and restart dev server.'
    );
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
  const snap = await withTimeout(getDoc(userRef), 10000);
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
    ),
    10000
  );
}

function getFirebaseErrorCode(error: unknown): string {
  const code = String((error as any)?.code || '').trim();
  return code;
}

function normalizeFirebaseError(error: unknown): Error {
  const code = getFirebaseErrorCode(error);
  const msg = String((error as any)?.message || '').trim();

  if (code === 'auth/unauthorized-domain') {
    return new Error(
      'Google login is blocked for this domain. Add your site domain to Firebase Auth > Authorized domains.'
    );
  }

  if (code === 'auth/popup-blocked') {
    return new Error('Popup was blocked by the browser. Allow popups and try Google sign-in again.');
  }

  if (code === 'auth/popup-closed-by-user') {
    return new Error('Google sign-in was closed before completion. Please try again.');
  }

  if (code === 'permission-denied' || /missing or insufficient permissions/i.test(msg)) {
    return new Error(
      'Firestore permission denied. Deploy Firestore rules and ensure the users collection can be written.'
    );
  }

  if (code === 'not-found' || /database .* does not exist/i.test(msg)) {
    return new Error('Firestore database not found. Create Firestore Database in Firebase Console first.');
  }

  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return new Error('Firebase service is temporarily unavailable. Please retry in a few seconds.');
  }

  if (msg) return new Error(msg);
  return new Error('Firebase request failed. Please try again.');
}

async function syncUserProfileWithRetry(user: User, name?: string, phone?: string): Promise<void> {
  let lastError: unknown = null;
  for (let i = 0; i < 2; i++) {
    try {
      await upsertUserProfile({ user, name, phone });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw normalizeFirebaseError(lastError);
}

export async function registerWithEmail(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  assertFirebaseReady();
  try {
    const credential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    if (params.name) {
      await updateProfile(credential.user, { displayName: params.name });
    }
    await syncUserProfileWithRetry(credential.user, params.name, params.phone);
    return credential.user;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function loginWithEmail(email: string, password: string) {
  assertFirebaseReady();
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await syncUserProfileWithRetry(credential.user);
    return credential.user;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
}

export async function continueWithGoogle() {
  assertFirebaseReady();
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    await syncUserProfileWithRetry(credential.user);
    return credential.user;
  } catch (error) {
    throw normalizeFirebaseError(error);
  }
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
      void syncUserProfileWithRetry(user).catch((err) => {
        console.error('Profile sync failed on auth state change:', err);
      });
    }
    callback(user);
  });
}

export async function logoutUser() {
  assertFirebaseReady();
  await signOut(auth);
}
