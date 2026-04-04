'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { PRODUCTS, CartItem } from '@/lib/data';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const DEFAULT_ITEMS: CartItem[] = [
  { ...PRODUCTS[0], quantity: 2 },
  { ...PRODUCTS[4], quantity: 1 },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_ITEMS);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) setItems(prev => prev.filter(i => i.id !== id));
    else setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} />
      <main className="min-h-screen bg-cream-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl text-cocoa-800 mb-8">
            Your Cart <span className="text-lg text-cocoa-700/50 font-body font-normal">({cartCount} items)</span>
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={64} className="text-cream-300 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-cocoa-800 mb-3">Your cart is empty</h2>
              <Link href="/products" className="inline-flex items-center gap-2 bg-blush-500 text-white px-6 py-3 rounded-full font-body font-medium hover:bg-blush-600 transition-colors mt-2">
                Start Shopping <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-sage-600 font-body uppercase tracking-wide mb-0.5">{item.category}</p>
                      <h3 className="font-display text-base text-cocoa-800 leading-snug mb-1">{item.name}</h3>
                      {item.ageRange && <p className="text-xs text-cocoa-700/50 font-body">Ages: {item.ageRange}</p>}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-cream-100 rounded-full px-3 py-1.5">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-cream-300 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium font-body">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-cream-300 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg text-cocoa-800">₹{(item.price * item.quantity).toFixed(0)}</span>
                          <button onClick={() => updateQty(item.id, 0)} className="text-cocoa-700/30 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/products" className="inline-flex items-center gap-2 text-sm text-blush-500 hover:text-blush-600 font-body transition-colors">
                  ← Continue Shopping
                </Link>
              </div>

              {/* Summary */}
              <div>
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                  <h2 className="font-display text-xl text-cocoa-800 mb-4">Order Summary</h2>

                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-700/40" />
                      <input value={coupon} onChange={e => setCoupon(e.target.value)}
                        placeholder="Coupon code"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                    </div>
                    <button onClick={() => coupon && setCouponApplied(true)}
                      className="px-4 bg-cocoa-800 text-cream-100 rounded-xl text-sm font-medium font-body hover:bg-cocoa-900 transition-colors">
                      Apply
                    </button>
                  </div>
                  {couponApplied && <p className="text-xs text-sage-600 font-body mb-4">✓ 10% discount applied!</p>}

                  <div className="space-y-3 border-t border-cream-200 pt-4">
                    <div className="flex justify-between text-sm font-body text-cocoa-700">
                      <span>Subtotal ({cartCount} items)</span><span>₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-body text-cocoa-700">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-sage-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm font-body text-sage-600">
                        <span>Discount</span><span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium pt-2 border-t border-cream-200">
                      <span className="font-body text-cocoa-800">Total</span>
                      <span className="font-display text-xl text-cocoa-800">₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  {subtotal < 999 && (
                    <div className="mt-3 p-3 bg-blush-50 rounded-xl text-xs text-blush-600 font-body">
                      Add ₹{(999 - subtotal).toFixed(0)} more for free shipping!
                    </div>
                  )}

                  <Link href="/checkout">
                    <button className="w-full mt-5 flex items-center justify-center gap-2 bg-blush-500 hover:bg-blush-600 text-white py-3.5 rounded-full font-medium font-body transition-colors">
                      Proceed to Checkout <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
