import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type CouponDiscountType = 'percent' | 'fixed';

export type CouponDoc = {
  id: string;
  code: string;
  codeUpper: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  productIds: string[];
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateCouponInput = {
  code: string;
  title: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  productIds: string[];
  active: boolean;
};

function toCouponDoc(id: string, raw: any): CouponDoc {
  return {
    id,
    code: String(raw?.code || ''),
    codeUpper: String(raw?.codeUpper || ''),
    title: String(raw?.title || ''),
    description: String(raw?.description || ''),
    discountType: raw?.discountType === 'fixed' ? 'fixed' : 'percent',
    discountValue: Number(raw?.discountValue || 0),
    productIds: Array.isArray(raw?.productIds) ? raw.productIds.map((x: any) => String(x || '')).filter(Boolean) : [],
    active: Boolean(raw?.active),
    createdAt: raw?.createdAt || null,
    updatedAt: raw?.updatedAt || null,
  };
}

export function subscribeCoupons(onData: (rows: CouponDoc[]) => void): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toCouponDoc(d.id, d.data()))),
    () => onData([])
  );
}

export function subscribeActiveCouponsForProduct(
  productId: string | null | undefined,
  onData: (rows: CouponDoc[]) => void
): Unsubscribe {
  if (!db || !productId) {
    onData([]);
    return () => undefined;
  }
  const q = query(collection(db, 'coupons'), where('active', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => toCouponDoc(d.id, d.data()))
        .filter((c) => c.productIds.includes(String(productId)));
      onData(rows);
    },
    () => onData([])
  );
}

export async function createCoupon(input: CreateCouponInput): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const code = String(input.code || '').trim();
  const codeUpper = code.toUpperCase();
  if (!codeUpper) throw new Error('Coupon code is required.');
  if (!input.productIds?.length) throw new Error('Select at least one product.');
  if (!Number.isFinite(input.discountValue) || Number(input.discountValue) <= 0) {
    throw new Error('Discount value must be greater than 0.');
  }
  await addDoc(collection(db, 'coupons'), {
    code,
    codeUpper,
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    discountType: input.discountType,
    discountValue: Number(input.discountValue),
    productIds: input.productIds.map((id) => String(id)).filter(Boolean),
    active: Boolean(input.active),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCoupon(
  id: string,
  input: Partial<Omit<CreateCouponInput, 'code'>> & { code?: string }
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const payload: any = {
    updatedAt: serverTimestamp(),
  };
  if (input.code !== undefined) {
    payload.code = String(input.code || '').trim();
    payload.codeUpper = String(input.code || '').trim().toUpperCase();
  }
  if (input.title !== undefined) payload.title = String(input.title || '').trim();
  if (input.description !== undefined) payload.description = String(input.description || '').trim();
  if (input.discountType !== undefined) payload.discountType = input.discountType;
  if (input.discountValue !== undefined) payload.discountValue = Number(input.discountValue || 0);
  if (input.productIds !== undefined) payload.productIds = input.productIds.map((x) => String(x)).filter(Boolean);
  if (input.active !== undefined) payload.active = Boolean(input.active);
  await updateDoc(doc(db, 'coupons', id), payload);
}

export type CouponApplyResult = {
  ok: boolean;
  message: string;
  coupon: CouponDoc | null;
  eligibleSubtotal: number;
  discountAmount: number;
};

export function applyCouponToItems(
  coupons: CouponDoc[],
  code: string,
  items: Array<{ id: string; price: number; quantity: number }>
): CouponApplyResult {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    return { ok: false, message: 'Enter coupon code.', coupon: null, eligibleSubtotal: 0, discountAmount: 0 };
  }
  const coupon = coupons.find((c) => c.codeUpper === normalized);
  if (!coupon) {
    return { ok: false, message: 'Invalid coupon code.', coupon: null, eligibleSubtotal: 0, discountAmount: 0 };
  }
  if (!coupon.active) {
    return { ok: false, message: 'Coupon is inactive.', coupon, eligibleSubtotal: 0, discountAmount: 0 };
  }
  const eligibleSubtotal = items
    .filter((i) => coupon.productIds.includes(String(i.id)))
    .reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
  if (eligibleSubtotal <= 0) {
    return { ok: false, message: 'Coupon is not applicable to these products.', coupon, eligibleSubtotal: 0, discountAmount: 0 };
  }
  const rawDiscount =
    coupon.discountType === 'percent'
      ? (eligibleSubtotal * Number(coupon.discountValue || 0)) / 100
      : Number(coupon.discountValue || 0);
  const discountAmount = Math.max(0, Math.min(eligibleSubtotal, rawDiscount));
  return {
    ok: true,
    message: 'Coupon applied.',
    coupon,
    eligibleSubtotal,
    discountAmount,
  };
}
