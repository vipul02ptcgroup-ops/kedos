import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const configuredStorageBucket = String(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '').trim();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ...(configuredStorageBucket ? { storageBucket: configuredStorageBucket } : {}),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingFirebaseConfig = Object.entries({
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
})
  .filter(([, value]) => !String(value || '').trim())
  .map(([key]) => key);

const canInitializeFirebase = missingFirebaseConfig.length === 0;

const app = canInitializeFirebase
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseClientInitError = canInitializeFirebase
  ? null
  : `Missing Firebase client env vars: ${missingFirebaseConfig.join(', ')}`;

export const auth = app ? getAuth(app) : (null as any);
export const db = app ? getFirestore(app) : (null as any);
export const storage = app
  ? configuredStorageBucket
    ? getStorage(app, `gs://${configuredStorageBucket}`)
    : getStorage(app)
  : (null as any);
