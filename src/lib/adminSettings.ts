import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type StoreSettings = {
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
};

export type NotificationSettings = {
  newOrder: boolean;
  lowStockAlert: boolean;
  customerSignup: boolean;
  paymentFailed: boolean;
  reviewPosted: boolean;
  returnRequest: boolean;
};

export type ShippingSettings = {
  freeShippingThreshold: number;
  standardPrice: number;
  expressPrice: number;
};

export type PaymentSettings = {
  razorpay: boolean;
  cod: boolean;
  paypal: boolean;
};

export type SecuritySettings = {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
};

export type AdminSettings = {
  store: StoreSettings;
  notifications: NotificationSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  security: SecuritySettings;
};

const SETTINGS_DOC_ID = 'main';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  store: {
    storeName: 'Kedos',
    tagline: 'Baby Boutique',
    email: 'ptcvirar@gmail.com',
    phone: '+91 91208 79879',
    address: 'Virar (East), Maharashtra, India, Mumbai 400053',
  },
  notifications: {
    newOrder: true,
    lowStockAlert: true,
    customerSignup: true,
    paymentFailed: true,
    reviewPosted: true,
    returnRequest: true,
  },
  shipping: {
    freeShippingThreshold: 999,
    standardPrice: 99,
    expressPrice: 199,
  },
  payment: {
    razorpay: true,
    cod: true,
    paypal: false,
  },
  security: {
    twoFactorAuth: false,
    loginNotifications: false,
  },
};

function normalize(raw: any): AdminSettings {
  return {
    store: {
      storeName: String(raw?.store?.storeName || DEFAULT_ADMIN_SETTINGS.store.storeName),
      tagline: String(raw?.store?.tagline || DEFAULT_ADMIN_SETTINGS.store.tagline),
      email: String(raw?.store?.email || DEFAULT_ADMIN_SETTINGS.store.email),
      phone: String(raw?.store?.phone || DEFAULT_ADMIN_SETTINGS.store.phone),
      address: String(raw?.store?.address || DEFAULT_ADMIN_SETTINGS.store.address),
    },
    notifications: {
      newOrder: Boolean(raw?.notifications?.newOrder ?? DEFAULT_ADMIN_SETTINGS.notifications.newOrder),
      lowStockAlert: Boolean(raw?.notifications?.lowStockAlert ?? DEFAULT_ADMIN_SETTINGS.notifications.lowStockAlert),
      customerSignup: Boolean(raw?.notifications?.customerSignup ?? DEFAULT_ADMIN_SETTINGS.notifications.customerSignup),
      paymentFailed: Boolean(raw?.notifications?.paymentFailed ?? DEFAULT_ADMIN_SETTINGS.notifications.paymentFailed),
      reviewPosted: Boolean(raw?.notifications?.reviewPosted ?? DEFAULT_ADMIN_SETTINGS.notifications.reviewPosted),
      returnRequest: Boolean(raw?.notifications?.returnRequest ?? DEFAULT_ADMIN_SETTINGS.notifications.returnRequest),
    },
    shipping: {
      freeShippingThreshold: Number(raw?.shipping?.freeShippingThreshold ?? DEFAULT_ADMIN_SETTINGS.shipping.freeShippingThreshold),
      standardPrice: Number(raw?.shipping?.standardPrice ?? DEFAULT_ADMIN_SETTINGS.shipping.standardPrice),
      expressPrice: Number(raw?.shipping?.expressPrice ?? DEFAULT_ADMIN_SETTINGS.shipping.expressPrice),
    },
    payment: {
      razorpay: Boolean(raw?.payment?.razorpay ?? DEFAULT_ADMIN_SETTINGS.payment.razorpay),
      cod: Boolean(raw?.payment?.cod ?? DEFAULT_ADMIN_SETTINGS.payment.cod),
      paypal: Boolean(raw?.payment?.paypal ?? DEFAULT_ADMIN_SETTINGS.payment.paypal),
    },
    security: {
      twoFactorAuth: Boolean(raw?.security?.twoFactorAuth ?? DEFAULT_ADMIN_SETTINGS.security.twoFactorAuth),
      loginNotifications: Boolean(raw?.security?.loginNotifications ?? DEFAULT_ADMIN_SETTINGS.security.loginNotifications),
    },
  };
}

export function subscribeAdminSettings(onData: (data: AdminSettings) => void): Unsubscribe {
  if (!db) {
    onData(DEFAULT_ADMIN_SETTINGS);
    return () => undefined;
  }
  const ref = doc(db, 'settings', SETTINGS_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(DEFAULT_ADMIN_SETTINGS);
        return;
      }
      onData(normalize(snap.data()));
    },
    () => onData(DEFAULT_ADMIN_SETTINGS)
  );
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  if (!db) throw new Error('Firebase is not configured');
  const ref = doc(db, 'settings', SETTINGS_DOC_ID);
  await setDoc(
    ref,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
