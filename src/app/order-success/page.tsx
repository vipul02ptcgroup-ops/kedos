import Link from 'next/link';
import { CheckCircle, Package, Truck, Home, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success animation */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-sage-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-28 h-28 bg-sage-100 rounded-full flex items-center justify-center">
              <CheckCircle size={60} className="text-sage-500" />
            </div>
          </div>

          <h1 className="font-display text-4xl text-cocoa-800 mb-3">Order Confirmed! 🎉</h1>
          <p className="text-lg text-cocoa-700/70 font-body mb-2">
            Thank you for your order, <strong className="text-cocoa-800">Anjali</strong>!
          </p>
          <p className="text-cocoa-700/60 font-body text-sm mb-8">
            A confirmation has been sent to <span className="text-blush-500">anjali@example.com</span>
          </p>

          {/* Order info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 text-left mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Order ID', val: '#ORD-0072' },
                { label: 'Date', val: 'Mar 31, 2024' },
                { label: 'Total', val: '₹1,04.97' },
                { label: 'Payment', val: 'Paid ✓' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-cream-50 rounded-xl">
                  <div className="text-xs text-cocoa-700/50 font-body mb-1">{item.label}</div>
                  <div className="font-display text-sm text-cocoa-800">{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery progress */}
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                      ${step.done ? 'bg-sage-100 text-sage-600' : 'bg-cream-100 text-cocoa-700/30'}`}>
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
              Estimated delivery: <strong className="text-cocoa-800">April 3–5, 2024</strong>
            </p>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-left">
            <h2 className="font-display text-lg text-cocoa-800 mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {[
                { name: 'Organic Cotton Onesie Set', qty: 2, price: 49.98, img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=100&q=80' },
                { name: 'Ergonomic Baby Carrier', qty: 1, price: 89.99, img: 'https://images.unsplash.com/photo-1565140736068-51e3694f3e5d?w=100&q=80' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-cocoa-800 font-body">{item.name}</p>
                    <p className="text-xs text-cocoa-700/50 font-body">Qty: {item.qty}</p>
                  </div>
                  <span className="font-display text-sm text-cocoa-800">₹{item.price.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
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
