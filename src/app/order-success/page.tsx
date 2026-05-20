'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getOrderById, type FirestoreOrder } from '@/lib/orders';

type SnapshotOrder = {
  id: string;
  orderCode?: string;
  customerName: string;
  email: string;
  paymentMethod: string;
  items: Array<{ productId: string; name: string; image: string; category: string; price: number; quantity: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  createdAtIso?: string;
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<FirestoreOrder | null>(null);
  const [snapshotOrder, setSnapshotOrder] = useState<SnapshotOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('orderId') || '');
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        if (orderId) {
          const liveOrder = await getOrderById(orderId);
          if (active && liveOrder) {
            setOrder(liveOrder);
            setSnapshotOrder(null);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall back to session snapshot below.
      }

      if (typeof window !== 'undefined' && active) {
        const raw = sessionStorage.getItem('lastOrderSnapshot');
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as SnapshotOrder;
            setSnapshotOrder(parsed);
          } catch {
            setSnapshotOrder(null);
          }
        }
      }

      if (active) setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const resolved = useMemo(() => {
    if (order) {
      return {
        id: order.id,
        orderCode: order.orderCode || '',
        customerName: order.customerName,
        email: order.email,
        paymentMethod: order.paymentMethod,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt?.toDate?.() || null,
      };
    }

    if (snapshotOrder) {
      return {
        id: snapshotOrder.id,
        orderCode: snapshotOrder.orderCode || '',
        customerName: snapshotOrder.customerName,
        email: snapshotOrder.email,
        paymentMethod: snapshotOrder.paymentMethod,
        items: snapshotOrder.items,
        total: snapshotOrder.total,
        createdAt: snapshotOrder.createdAtIso ? new Date(snapshotOrder.createdAtIso) : null,
      };
    }

    return null;
  }, [order, snapshotOrder]);

  const orderDate = resolved?.createdAt
    ? resolved.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  const etaRange = useMemo(() => {
    const base = resolved?.createdAt || new Date();
    const start = new Date(base);
    start.setDate(start.getDate() + 3);
    const end = new Date(base);
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }, [resolved?.createdAt]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-sage-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-28 h-28 bg-sage-100 rounded-full flex items-center justify-center">
              <CheckCircle size={60} className="text-sage-500" />
            </div>
          </div>

          <h1 className="font-display text-4xl text-cocoa-800 mb-3">Order Confirmed!</h1>

          {loading ? (
            <p className="text-cocoa-700/70 font-body mb-8">Loading your order details...</p>
          ) : !resolved ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <p className="text-cocoa-700 font-body">We could not find your order details.</p>
              <p className="text-sm text-cocoa-700/60 font-body mt-2">Please check your profile order history.</p>
            </div>
          ) : (
            <>
              <p className="text-lg text-cocoa-700/70 font-body mb-2">
                Thank you for your order, <strong className="text-cocoa-800">{resolved.customerName || 'Customer'}</strong>!
              </p>
              <p className="text-cocoa-700/60 font-body text-sm mb-8">
                A confirmation has been sent to <span className="text-blush-500">{resolved.email || '-'}</span>
              </p>

              <div className="bg-white rounded-2xl shadow-sm p-6 text-left mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'Order ID', val: `#${resolved.orderCode || resolved.id}` },
                    { label: 'Date', val: orderDate },
                    { label: 'Total', val: `?${resolved.total.toFixed(0)}` },
                    { label: 'Payment', val: resolved.paymentMethod.toUpperCase() },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-cream-50 rounded-xl">
                      <div className="text-xs text-cocoa-700/50 font-body mb-1">{item.label}</div>
                      <div className="font-display text-sm text-cocoa-800">{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="font-display text-lg text-cocoa-800 mb-5 text-left">Delivery Tracking</h2>
                <div className="flex items-start gap-0">
                  {[
                    { icon: CheckCircle, label: 'Order Placed', done: true },
                    { icon: Package, label: 'Being Packed', done: false },
                    { icon: Truck, label: 'On the Way', done: false },
                    { icon: Home, label: 'Delivered', done: false },
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {i > 0 && <div className={`flex-1 h-0.5 ${step.done ? 'bg-sage-400' : 'bg-cream-200'}`} />}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-sage-100 text-sage-600' : 'bg-cream-100 text-cocoa-700/30'}`}>
                          <step.icon size={20} />
                        </div>
                        {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-cream-200" />}
                      </div>
                      <p className={`text-xs mt-2 text-center font-body ${step.done ? 'text-sage-600 font-medium' : 'text-cocoa-700/40'}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-cocoa-700/60 font-body mt-4">
                  Estimated delivery: <strong className="text-cocoa-800">{etaRange}</strong>
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-left">
                <h2 className="font-display text-lg text-cocoa-800 mb-4">Items Ordered</h2>
                <div className="space-y-3">
                  {resolved.items.map((item) => (
                    <div key={`${item.productId}-${item.name}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cocoa-800 font-body">{item.name}</p>
                        <p className="text-xs text-cocoa-700/50 font-body">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-display text-sm text-cocoa-800">?{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-cocoa-800 text-cream-100 rounded-full font-medium font-body hover:bg-cocoa-900 transition-colors">
              <Package size={16} /> Track Order
            </Link>
            <Link href="/products" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blush-500 text-white rounded-full font-medium font-body hover:bg-blush-600 transition-colors">
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
