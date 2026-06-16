import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  cartItemId?: string;
  variantId?: string;
  variantLabel?: string;
  variantColor?: string;
  variantSize?: string;
};

export type DeliveryAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
};

export type CreateOrderInput = {
  userId?: string;
  customerName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  couponTitle?: string;
  delivery: DeliveryAddress;
};

export type FirestoreOrder = {
  id: string;
  orderCode?: string;
  customerName: string;
  customerNameLower: string;
  email: string;
  emailLower: string;
  phone: string;
  userId: string | null;
  status: OrderStatus;
  paymentMethod: string;
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  couponTitle?: string;
  delivery: DeliveryAddress;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

function getOrderDateKey(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}${month}${year}`;
}

function formatOrderCode(dateKey: string, sequence: number): string {
  return `ORD-${dateKey}-${String(sequence).padStart(3, '0')}`;
}

async function getNextOrderCode(): Promise<string> {
  if (!db) throw new Error('Firebase is not configured');
  const dateKey = getOrderDateKey();
  const counterRef = doc(collection(db, 'orderCounters'), dateKey);
  let next = 1;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? Number((snap.data() as { count?: number }).count || 0) : 0;
    next = current + 1;
    tx.set(counterRef, { count: next, updatedAt: serverTimestamp() }, { merge: true });
  });

  return formatOrderCode(dateKey, next);
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: string; orderCode: string }> {
  if (!db) throw new Error('Firebase is not configured');
  const customerName = input.customerName.trim() || 'Customer';
  const email = input.email.trim();
  const orderCode = await getNextOrderCode();
  const orderRef = await addDoc(collection(db, 'orders'), {
    orderCode,
    customerName,
    customerNameLower: customerName.toLowerCase(),
    email,
    emailLower: email.toLowerCase(),
    phone: input.phone.trim(),
    userId: input.userId || null,
    status: 'pending' as OrderStatus,
    paymentMethod: input.paymentMethod,
    items: input.items,
    itemsCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: input.subtotal,
    shipping: input.shipping,
    discount: input.discount,
    total: input.total,
    couponCode: String(input.couponCode || '').trim() || null,
    couponTitle: String(input.couponTitle || '').trim() || null,
    delivery: input.delivery,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: orderRef.id, orderCode };
}

export function subscribeOrders(
  onData: (orders: FirestoreOrder[]) => void,
  status?: OrderStatus | 'all'
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }

  const ordersRef = collection(db, 'orders');
  const ordersQuery =
    status && status !== 'all'
      ? query(ordersRef, where('status', '==', status), orderBy('createdAt', 'desc'))
      : query(ordersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    ordersQuery,
    (snap) => {
      const parsed = snap.docs.map((doc) => {
        const data = doc.data() as Omit<FirestoreOrder, 'id'>;
        return { id: doc.id, ...data } as FirestoreOrder;
      });
      onData(parsed);
    },
    () => onData([])
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  await updateDoc(doc(collection(db, 'orders'), orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderById(orderId: string): Promise<FirestoreOrder | null> {
  if (!db) throw new Error('Firebase is not configured');
  const snap = await getDoc(doc(collection(db, 'orders'), orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<FirestoreOrder, 'id'>) };
}

export function subscribeUserOrders(userId: string, onData: (orders: FirestoreOrder[]) => void): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }
  const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(
    ordersQuery,
    (snap) => {
      const parsed = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreOrder, 'id'>) }));
      onData(parsed);
    },
    () => onData([])
  );
}

export function subscribeOrdersForUserIdentity(
  params: { userId?: string | null; email?: string | null },
  onData: (orders: FirestoreOrder[]) => void
): Unsubscribe {
  if (!db) {
    onData([]);
    return () => undefined;
  }

  const userId = String(params.userId || '').trim();
  const emailRaw = String(params.email || '').trim();
  const emailLower = emailRaw.toLowerCase();
  if (!userId && !emailRaw) {
    onData([]);
    return () => undefined;
  }

  const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    ordersQuery,
    (snap) => {
      const filtered = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreOrder, 'id'>) }))
        .filter((o) => {
          const oUserId = String(o.userId || '').trim();
          const oEmail = String(o.email || '').trim();
          const oEmailLower = String((o as any).emailLower || '').trim().toLowerCase();
          return (userId && oUserId === userId) || (emailRaw && (oEmail === emailRaw || oEmailLower === emailLower));
        });
      onData(filtered);
    },
    () => onData([])
  );
}
