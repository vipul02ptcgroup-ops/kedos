function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || '';
  return key.replace(/\\n/g, '\n');
}

function normalizeBucketName(input?: string) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('gs://')) return trimmed.replace(/^gs:\/\//, '').replace(/\/+$/, '');
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const url = new URL(trimmed);
      if (url.hostname === 'storage.googleapis.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        return parts[0] || '';
      }
    } catch {
      return '';
    }
  }
  return trimmed.replace(/\/+$/, '');
}

async function initAdmin() {
  const adminApp = await import('firebase-admin/app');
  const { cert, getApps, initializeApp } = adminApp;
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();
  const missing: string[] = [];
  if (!projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

  if (missing.length) {
    throw new Error(`Missing Firebase Admin env vars: ${missing.join(', ')}`);
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // Prefer explicit bucket when provided; otherwise let Admin SDK resolve project default bucket.
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    ...(storageBucket ? { storageBucket } : {}),
  });
}

export async function getAdminStorageBucket() {
  const adminApp = await initAdmin();
  const storageApi = await import('firebase-admin/storage');
  return storageApi.getStorage(adminApp).bucket();
}

export async function resolveWorkingStorageBucket() {
  const adminApp = await initAdmin();
  const storageApi = await import('firebase-admin/storage');
  const storage = storageApi.getStorage(adminApp);
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  const candidates = [
    process.env.FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    projectId ? `${projectId}.firebasestorage.app` : '',
    projectId ? `${projectId}.appspot.com` : '',
  ]
    .map(normalizeBucketName)
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);

  let lastError: any = null;
  for (const bucketName of candidates) {
    try {
      const bucket = storage.bucket(bucketName);
      const [exists] = await bucket.exists();
      if (exists) return bucket;
    } catch (error: any) {
      lastError = error;
    }
  }

  // Final fallback: auto-discover buckets from GCP Storage API using Admin credential.
  try {
    const credential: any = (adminApp as any).options?.credential;
    const accessTokenResponse = await credential?.getAccessToken?.();
    const accessToken = accessTokenResponse?.access_token;
    if (projectId && accessToken) {
      const listUrl = `https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(projectId)}`;
      const response = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data: any = await response.json();
        const discovered = Array.isArray(data?.items)
          ? data.items
              .map((item: any) => normalizeBucketName(item?.name))
              .filter(Boolean)
              .filter((value: string, index: number, arr: string[]) => arr.indexOf(value) === index)
          : [];
        for (const bucketName of discovered) {
          try {
            const bucket = storage.bucket(bucketName);
            const [exists] = await bucket.exists();
            if (exists) return bucket;
          } catch (error: any) {
            lastError = error;
          }
        }
      }
    }
  } catch (error: any) {
    lastError = error;
  }

  const label = projectId || 'unknown-project';
  const attempted = candidates.length ? candidates.join(', ') : 'none';
  const suffix = lastError?.message ? ` Last error: ${String(lastError.message)}` : '';
  throw new Error(
    `No working Firebase Storage bucket found for ${label}. Tried: ${attempted}. ` +
      `Create/enable Storage in Firebase Console and set FIREBASE_STORAGE_BUCKET correctly.${suffix}`
  );
}
