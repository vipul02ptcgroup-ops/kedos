function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || '';
  return key.replace(/\\n/g, '\n');
}

async function initAdmin() {
  const adminApp = await import('firebase-admin/app');
  const { cert, getApps, initializeApp } = adminApp;
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error('Missing Firebase Admin env vars.');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

export async function getAdminStorageBucket() {
  const adminApp = await initAdmin();
  const storageApi = await import('firebase-admin/storage');
  return storageApi.getStorage(adminApp).bucket();
}
