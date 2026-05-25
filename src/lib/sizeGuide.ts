import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ClothingRow = {
  age: string;
  chest: string;
  length: string;
};

export type ShoeRow = {
  age: string;
  foot: string;
};

export type SizeGuideContent = {
  clothingRows: ClothingRow[];
  shoeRows: ShoeRow[];
  tips: string[];
  customSections: {
    title: string;
    rows: { label: string; value: string }[];
  }[];
};

const SIZE_GUIDE_DOC_ID = 'main';

export const DEFAULT_SIZE_GUIDE: SizeGuideContent = {
  clothingRows: [
    { age: '0-3 Months', chest: '16-18 in', length: '13-15 in' },
    { age: '3-6 Months', chest: '18-19 in', length: '15-16 in' },
    { age: '6-12 Months', chest: '19-20 in', length: '16-18 in' },
    { age: '1-2 Years', chest: '20-21 in', length: '18-20 in' },
    { age: '2-3 Years', chest: '21-22 in', length: '20-22 in' },
  ],
  shoeRows: [
    { age: '0-6 Months', foot: '9-10 cm' },
    { age: '6-12 Months', foot: '10-11 cm' },
    { age: '1-2 Years', foot: '11-12.5 cm' },
    { age: '2-3 Years', foot: '12.5-14 cm' },
  ],
  tips: [
    'Measure while your baby is relaxed and standing straight (if possible).',
    'Choose one size up if your child is between sizes for better comfort.',
    'Fabric type and style can cause slight size variation.',
  ],
  customSections: [],
};

function normalizeContent(raw: any): SizeGuideContent {
  return {
    clothingRows: Array.isArray(raw?.clothingRows)
      ? raw.clothingRows.map((r: any) => ({
          age: String(r?.age || ''),
          chest: String(r?.chest || ''),
          length: String(r?.length || ''),
        }))
      : DEFAULT_SIZE_GUIDE.clothingRows,
    shoeRows: Array.isArray(raw?.shoeRows)
      ? raw.shoeRows.map((r: any) => ({
          age: String(r?.age || ''),
          foot: String(r?.foot || ''),
        }))
      : DEFAULT_SIZE_GUIDE.shoeRows,
    tips: Array.isArray(raw?.tips) ? raw.tips.map((t: any) => String(t || '')) : DEFAULT_SIZE_GUIDE.tips,
    customSections: Array.isArray(raw?.customSections)
      ? raw.customSections.map((s: any) => ({
          title: String(s?.title || ''),
          rows: Array.isArray(s?.rows)
            ? s.rows.map((r: any) => ({ label: String(r?.label || ''), value: String(r?.value || '') }))
            : [],
        }))
      : DEFAULT_SIZE_GUIDE.customSections,
  };
}

export function subscribeSizeGuide(onData: (content: SizeGuideContent) => void): Unsubscribe {
  if (!db) {
    onData(DEFAULT_SIZE_GUIDE);
    return () => undefined;
  }
  const ref = doc(db, 'content', SIZE_GUIDE_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_SIZE_GUIDE);
        return;
      }
      onData(normalizeContent(snap.data()));
    },
    () => onData(DEFAULT_SIZE_GUIDE)
  );
}

export async function saveSizeGuide(content: SizeGuideContent): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const ref = doc(db, 'content', SIZE_GUIDE_DOC_ID);
  await setDoc(
    ref,
    {
      clothingRows: content.clothingRows,
      shoeRows: content.shoeRows,
      tips: content.tips,
      customSections: content.customSections,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
