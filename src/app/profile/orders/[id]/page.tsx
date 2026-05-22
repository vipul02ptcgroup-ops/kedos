'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Home, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { subscribeAuth } from '@/lib/auth';
import { getOrderById, type FirestoreOrder } from '@/lib/orders';

export default function ProfileOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = String(params?.id || '');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [order, setOrder] = useState<FirestoreOrder | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => setAuthed(Boolean(user)));
    return () => unsub();
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const found = await getOrderById(orderId);
        if (active) setOrder(found);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  const etaRange = useMemo(() => {
    const base = order?.createdAt?.toDate?.() || new Date();
    const start = new Date(base);
    start.setDate(start.getDate() + 3);
    const end = new Date(base);
    end.setDate(end.getDate() + 5);
    return `${start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }, [order]);

  const status = String(order?.status || 'pending');
  const doneIndex = status === 'pending' ? 0 : status === 'processing' ? 1 : status === 'shipped' ? 2 : status === 'delivered' ? 3 : 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-cocoa-700/70 hover:text-cocoa-800 mb-4">
            <ArrowLeft size={15} /> Back to Profile
          </Link>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="font-display text-2xl text-cocoa-800 mb-4">Order Details</h1>

            {!authed ? (
              <p className="text-sm text-cocoa-700/70">Please login to view order details.</p>
            ) : loading ? (
              <p className="text-sm text-cocoa-700/70">Loading order...</p>
            ) : !order ? (
              <p className="text-sm text-cocoa-700/70">Order not found.</p>
            ) : (
              <>
                <div className="grid sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-cream-50 rounded-xl p-3"><p className="text-xs text-cocoa-700/50">Order ID</p><p className="text-sm text-cocoa-800 font-medium">#{order.orderCode || order.id}</p></div>
                  <div className="bg-cream-50 rounded-xl p-3"><p className="text-xs text-cocoa-700/50">Date</p><p className="text-sm text-cocoa-800 font-medium">{order.createdAt?.toDate?.().toLocaleDateString('en-IN') || '-'}</p></div>
                  <div className="bg-cream-50 rounded-xl p-3"><p className="text-xs text-cocoa-700/50">Total</p><p className="text-sm text-cocoa-800 font-medium">Rs {Number(order.total || 0).toFixed(0)}</p></div>
                  <div className="bg-cream-50 rounded-xl p-3"><p className="text-xs text-cocoa-700/50">Status</p><p className="text-sm text-cocoa-800 font-medium capitalize">{order.status}</p></div>
                </div>

                <h2 className="font-display text-lg text-cocoa-800 mb-4">Tracking</h2>
                <div className="flex items-start gap-0 mb-6">
                  {[
                    { icon: CheckCircle, label: 'Order Placed' },
                    { icon: Package, label: 'Being Packed' },
                    { icon: Truck, label: 'On the Way' },
                    { icon: Home, label: 'Delivered' },
                  ].map((step, i, arr) => {
                    const done = i <= doneIndex;
                    return (
                      <div key={step.label} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center w-full">
                          {i > 0 && <div className={`flex-1 h-0.5 ${done ? 'bg-sage-400' : 'bg-cream-200'}`} />}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-sage-100 text-sage-600' : 'bg-cream-100 text-cocoa-700/30'}`}>
                            <step.icon size={20} />
                          </div>
                          {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${i < doneIndex ? 'bg-sage-400' : 'bg-cream-200'}`} />}
                        </div>
                        <p className={`text-xs mt-2 text-center ${done ? 'text-sage-600 font-medium' : 'text-cocoa-700/40'}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-cocoa-700/70 mb-6">Estimated delivery: <strong className="text-cocoa-800">{etaRange}</strong></p>

                <h2 className="font-display text-lg text-cocoa-800 mb-3">Items</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.name}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cocoa-800">{item.name}</p>
                        <p className="text-xs text-cocoa-700/50">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm text-cocoa-800 font-medium">Rs {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
