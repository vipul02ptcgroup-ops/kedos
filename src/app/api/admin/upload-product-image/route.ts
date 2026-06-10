import { NextResponse } from 'next/server';
import { resolveWorkingStorageBucket } from '@/lib/firebaseAdmin';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'Content-Type': 'application/json; charset=utf-8',
};

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

async function saveToBucket(
  bucket: any,
  objectPath: string,
  fileType: string,
  buffer: Buffer
) {
  const object = bucket.file(objectPath);
  const downloadToken = randomUUID();
  await object.save(buffer, {
    resumable: false,
    metadata: {
      contentType: fileType,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
  });
  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

function getExtensionFromName(value: string) {
  const clean = String(value || '').trim().toLowerCase();
  if (!clean.includes('.')) return '';
  return clean.split('.').pop() || '';
}

function getExtensionFromUrl(value: string) {
  try {
    const url = new URL(value);
    return getExtensionFromName(url.pathname);
  } catch {
    return '';
  }
}

function mimeTypeFromExtension(extension: string) {
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return '';
}

function isAllowedImageType(fileType: string) {
  return ALLOWED_IMAGE_TYPES.has(String(fileType || '').toLowerCase());
}

function isAllowedExtension(extension: string) {
  return ALLOWED_IMAGE_EXTENSIONS.has(String(extension || '').toLowerCase());
}

function makeSafeName(value: string, fallback = 'image') {
  const safe = String(value || '').replace(/[^a-zA-Z0-9.-]/g, '-');
  return safe.replace(/-+/g, '-').replace(/^-+|-+$/g, '') || fallback;
}

async function uploadBufferToStorage(
  bucket: any,
  buffer: Buffer,
  fileType: string,
  sourceName: string
) {
  if (!isAllowedImageType(fileType)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  if (buffer.byteLength > MAX_BYTES) {
    throw new Error('File is too large. Max 10MB.');
  }

  const safeName = makeSafeName(sourceName);
  const objectPath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
  return saveToBucket(bucket, objectPath, fileType, buffer);
}

async function handleFileUpload(bucket: any, file: File) {
  if (!isAllowedImageType(file.type)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('File is too large. Max 10MB.');
  }

  const extension = getExtensionFromName(file.name);
  if (extension && !isAllowedExtension(extension)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToStorage(bucket, buffer, file.type, file.name || `upload.${extension || 'jpg'}`);
}

async function handleRemoteImageUpload(bucket: any, imageUrl: string) {
  let remoteUrl: URL;
  try {
    remoteUrl = new URL(String(imageUrl || '').trim());
  } catch {
    throw new Error('Image URL is invalid.');
  }

  if (!['http:', 'https:'].includes(remoteUrl.protocol)) {
    throw new Error('Only http and https image URLs are allowed.');
  }

  const extensionFromUrl = getExtensionFromUrl(remoteUrl.toString());
  if (extensionFromUrl && !isAllowedExtension(extensionFromUrl)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  const response = await fetch(remoteUrl, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Unable to download image (HTTP ${response.status}).`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_BYTES) {
    throw new Error('Remote image is too large. Max 10MB.');
  }

  const responseType = String(response.headers.get('content-type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  const resolvedType = responseType || mimeTypeFromExtension(extensionFromUrl);

  if (!isAllowedImageType(resolvedType)) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error('Remote image is too large. Max 10MB.');
  }

  const extension = extensionFromUrl || getExtensionFromName(`file.${resolvedType.split('/')[1] || 'jpg'}`);
  const fileName = makeSafeName(remoteUrl.pathname.split('/').pop() || `remote-image.${extension || 'jpg'}`);
  return uploadBufferToStorage(bucket, buffer, resolvedType, fileName);
}

export async function POST(req: Request) {
  try {
    const adminStorage = await resolveWorkingStorageBucket();
    const contentType = String(req.headers.get('content-type') || '').toLowerCase();
    let url = '';

    if (contentType.includes('application/json')) {
      const body = (await req.json()) as { imageUrl?: unknown };
      const imageUrl = String(body?.imageUrl || '').trim();
      if (!imageUrl) {
        return NextResponse.json({ ok: false, error: 'No image URL provided.' }, { status: 400, headers: JSON_HEADERS });
      }
      url = await handleRemoteImageUpload(adminStorage, imageUrl);
    } else {
      const form = await req.formData();
      const file = form.get('file');

      if (!(file instanceof File)) {
        return NextResponse.json({ ok: false, error: 'No file uploaded.' }, { status: 400, headers: JSON_HEADERS });
      }

      url = await handleFileUpload(adminStorage, file);
    }

    return NextResponse.json({ ok: true, data: { url } }, { status: 200, headers: JSON_HEADERS });
  } catch (error: any) {
    const msg = String(error?.message || 'Upload failed.');
    const code = error?.code ? String(error.code) : '';
    if (msg.includes("Cannot find module 'firebase-admin")) {
      return NextResponse.json(
        { ok: false, error: "Server dependency missing: install 'firebase-admin' and restart." },
        { status: 500, headers: JSON_HEADERS }
      );
    }
    if (msg.includes('Missing Firebase Admin env vars')) {
      return NextResponse.json(
        { ok: false, error: msg.replace('Missing Firebase Admin env vars', 'Missing server env vars') },
        { status: 500, headers: JSON_HEADERS }
      );
    }
    if (msg.includes('No working Firebase Storage bucket found')) {
      return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: JSON_HEADERS });
    }
    return NextResponse.json(
      {
        ok: false,
        error: code ? `${msg} (code: ${code})` : msg,
      },
      { status: 500, headers: JSON_HEADERS }
    );
  }
}
