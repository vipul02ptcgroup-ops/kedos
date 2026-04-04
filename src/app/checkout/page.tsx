'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Shield, Truck, Tag, CreditCard, Smartphone } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SAMPLE_ITEMS = [
  { ...PRODUCTS[0], quantity: 2 },
  { ...PRODUCTS[2], quantity: 1 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = SAMPLE_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const STEPS = ['Delivery', 'Payment', 'Review'];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-cocoa-800 mb-4">Checkout</h1>
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 cursor-pointer`} onClick={() => i + 1 <= step && setStep(i + 1)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium font-body transition-colors
                      ${i + 1 === step ? 'bg-blush-500 text-white' : i + 1 < step ? 'bg-sage-500 text-white' : 'bg-cream-200 text-cocoa-700/50'}`}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-body hidden sm:inline ${i + 1 === step ? 'text-blush-600 font-medium' : 'text-cocoa-700/50'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i + 1 < step ? 'bg-sage-400' : 'bg-cream-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-5">
              {/* Step 1: Delivery */}
              {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-display text-xl text-cocoa-800 mb-5">Delivery Information</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[['First Name', 'Anjali'], ['Last Name', 'Sharma']].map(([lbl, ph]) => (
                        <div key={lbl}>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">{lbl} *</label>
                          <input defaultValue={ph} className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email *</label>
                      <input type="email" defaultValue="anjali@example.com" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Phone *</label>
                      <input type="tel" defaultValue="+91 91208 79879" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Address *</label>
                      <textarea rows={2} defaultValue="12 Sunrise Society, Andheri West" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-cocoa-800" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[['City', 'Mumbai'], ['State', 'Maharashtra'], ['PIN', '400053']].map(([lbl, val]) => (
                        <div key={lbl}>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">{lbl} *</label>
                          <input defaultValue={val} className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-cream-50 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-cocoa-800 font-body">Delivery Method</p>
                    {[
                      { id: 'std', label: 'Standard Delivery', sub: '3–5 business days', price: subtotal > 999 ? 'FREE' : '₹99' },
                      { id: 'exp', label: 'Express Delivery', sub: '1–2 business days', price: '₹199' },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-cream-100 transition-colors">
                        <input type="radio" name="delivery" defaultChecked={opt.id === 'std'} className="accent-blush-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-cocoa-800 font-body">{opt.label}</div>
                          <div className="text-xs text-cocoa-700/50 font-body">{opt.sub}</div>
                        </div>
                        <span className={`text-sm font-body font-medium ${opt.price === 'FREE' ? 'text-sage-600' : 'text-cocoa-800'}`}>{opt.price}</span>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} className="mt-5 w-full py-3.5 bg-blush-500 hover:bg-blush-600 text-white rounded-full font-medium font-body transition-colors flex items-center justify-center gap-2">
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-display text-xl text-cocoa-800 mb-5">Payment Method</h2>
                  <div className="space-y-3 mb-5">
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
                      { id: 'upi', label: 'UPI', icon: <Smartphone size={18} /> },
                      { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                    ].map(m => (
                      <label key={m.id} onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === m.id ? 'border-blush-400 bg-blush-50' : 'border-cream-200 hover:border-cream-300'}`}>
                        <input type="radio" name="payment" checked={paymentMethod === m.id} readOnly className="accent-blush-500" />
                        <span className="text-blush-500">{m.icon}</span>
                        <span className="text-sm font-medium text-cocoa-800 font-body">{m.label}</span>
                      </label>
                    ))}
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 p-4 bg-cream-50 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Card Number</label>
                        <input placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Expiry</label>
                          <input placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">CVV</label>
                          <input placeholder="•••" type="password" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'upi' && (
                    <div className="p-4 bg-cream-50 rounded-xl">
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">UPI ID</label>
                      <input placeholder="yourname@upi" className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                    </div>
                  )}
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(1)} className="px-6 py-3.5 border-2 border-cream-200 rounded-full font-medium font-body text-cocoa-700 hover:bg-cream-100 transition-colors">
                      Back
                    </button>
                    <Link href="/order-success" className="flex-1">
                      <button disabled onClick={() => setStep(3)} className="w-full py-3.5 bg-blush-500 hover:bg-blush-600 text-white rounded-full font-medium font-body transition-colors flex items-center justify-center gap-2">
                        Place Order · ₹{total.toFixed(0)} <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-cocoa-700/50 font-body">
                    <Shield size={13} /> Secured by 256-bit SSL encryption
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="font-display text-lg text-cocoa-800 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {SAMPLE_ITEMS.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blush-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-body">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-cocoa-800 font-body line-clamp-1">{item.name}</p>
                        <p className="text-xs text-cocoa-700/50 font-body">{item.category}</p>
                      </div>
                      <span className="text-sm font-display text-cocoa-800 shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-700/40" />
                    <input value={coupon} onChange={e => setCoupon(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                  </div>
                  <button onClick={() => coupon && setCouponApplied(true)}
                    className="px-4 py-2.5 bg-cocoa-800 text-cream-100 rounded-xl text-sm font-medium font-body hover:bg-cocoa-900 transition-colors">
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <div className="text-xs text-sage-600 font-body bg-sage-50 px-3 py-2 rounded-lg mb-4">
                    ✓ Coupon applied — 10% off!
                  </div>
                )}

                <div className="space-y-2 border-t border-cream-200 pt-4">
                  <div className="flex justify-between text-sm font-body text-cocoa-700">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
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
                    <span className="font-display text-cocoa-800">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-cocoa-700/50 font-body">
                  <Truck size={13} className="text-sage-500" />
                  {subtotal > 999 ? 'Free shipping applied!' : `Add ₹${(999 - subtotal).toFixed(0)} more for free shipping`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
