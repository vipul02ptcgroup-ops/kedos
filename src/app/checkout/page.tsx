'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Shield, Truck, Tag, CreditCard, Smartphone, IndianRupee  } from 'lucide-react';
import { Product } from '@/lib/data';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { subscribeProducts } from '@/lib/products';
import { getUserProfile, subscribeAuth } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import { UserAddress, subscribeUserAddresses } from '@/lib/addresses';

export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);
  const [isPinTrusted, setIsPinTrusted] = useState(false);
  const [allowManualLocation, setAllowManualLocation] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [userId, setUserId] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const router = useRouter();
  const [deliveryForm, setDeliveryForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: '',
  });

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) return;
      setUserId(user.uid || '');

      const profile = await getUserProfile(user.uid).catch(() => null);
      const fullName = (profile?.name || user.displayName || '').trim();
      const [firstName, ...last] = fullName.split(' ');

      setDeliveryForm((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: last.join(' ') || prev.lastName,
        email: user.email || profile?.email || prev.email,
        phone: profile?.phone || user.phoneNumber || prev.phone,
      }));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) {
      setSavedAddresses([]);
      setSelectedAddressId('');
      setShowAddressForm(true);
      return;
    }
    const unsub = subscribeUserAddresses(userId, (rows) => {
      setSavedAddresses(rows);
      setShowAddressForm(rows.length === 0);
      const defaultAddress = rows.find((a) => a.isDefault) || rows[0];
      if (!defaultAddress) return;
      setSelectedAddressId(defaultAddress.id);
      const hasTrustedPin = /^\d{6}$/.test((defaultAddress.pin || '').trim()) && Boolean(defaultAddress.city?.trim() && defaultAddress.state?.trim());
      setIsPinTrusted(hasTrustedPin);
      setIsPinValid(hasTrustedPin);
      setPinError('');
      setDeliveryForm((prev) => ({
        ...prev,
        firstName: defaultAddress.firstName || prev.firstName,
        lastName: defaultAddress.lastName || prev.lastName,
        phone: defaultAddress.phone || prev.phone,
        address: defaultAddress.addressLine || prev.address,
        pin: defaultAddress.pin || prev.pin,
        city: defaultAddress.city || prev.city,
        state: defaultAddress.state || prev.state,
      }));
    });
    return () => unsub();
  }, [userId]);

  const applyAddressById = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
    const address = savedAddresses.find((a) => a.id === addressId);
    if (!address) return;
    const hasTrustedPin = /^\d{6}$/.test((address.pin || '').trim()) && Boolean(address.city?.trim() && address.state?.trim());
    setIsPinTrusted(hasTrustedPin);
    setIsPinValid(hasTrustedPin);
    setPinError('');
    setDeliveryForm((prev) => ({
      ...prev,
      firstName: address.firstName || prev.firstName,
      lastName: address.lastName || prev.lastName,
      phone: address.phone || prev.phone,
      address: address.addressLine || prev.address,
      pin: address.pin || prev.pin,
      city: address.city || prev.city,
      state: address.state || prev.state,
    }));
  };

  useEffect(() => {
    const pin = deliveryForm.pin.trim();
    const hasCityState = Boolean(deliveryForm.city.trim() && deliveryForm.state.trim());

    if (!pin) {
      setPinError('');
      setIsPinValid(false);
      setIsPinTrusted(false);
      setAllowManualLocation(false);
      setDeliveryForm((prev) => ({ ...prev, city: '', state: '' }));
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setPinError('PIN must be 6 digits.');
      setIsPinValid(false);
      setIsPinTrusted(false);
      setAllowManualLocation(false);
      setDeliveryForm((prev) => ({ ...prev, city: '', state: '' }));
      return;
    }

    if (isPinTrusted && hasCityState) {
      setPinError('');
      setIsPinValid(true);
      setIsPinLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setIsPinLoading(true);
        setPinError('');

        const res = await fetch(`/api/pincode/${pin}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data?.ok) {
          setIsPinValid(false);
          setPinError('Invalid PIN code. Please enter a valid PIN.');
          setDeliveryForm((prev) => ({ ...prev, city: '', state: '' }));
          return;
        }

        const city = String(data?.city || '').trim();
        const state = String(data?.state || '').trim();
        if (!city || !state) {
          setIsPinValid(false);
          setPinError('Could not fetch city/state for this PIN. Please use another PIN.');
          setDeliveryForm((prev) => ({ ...prev, city: '', state: '' }));
          return;
        }

        setDeliveryForm((prev) => ({
          ...prev,
          city,
          state,
        }));
        setAllowManualLocation(false);
        setIsPinValid(true);
      } catch {
        if (cancelled) return;
        setIsPinValid(false);
        setAllowManualLocation(true);
        setPinError('Unable to verify PIN right now. Enter city/state manually and continue.');
      } finally {
        if (!cancelled) setIsPinLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [deliveryForm.pin, deliveryForm.city, deliveryForm.state, isPinTrusted]);

  const sampleItems = useMemo(() => {
    return products.slice(0, 2).map((item) => ({ ...item, quantity: 1 }));
  }, [products]);

  const subtotal = sampleItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;
  const hasManualLocation = Boolean(deliveryForm.city.trim() && deliveryForm.state.trim());
  const isDeliveryComplete = Boolean(
    deliveryForm.firstName.trim() &&
      deliveryForm.lastName.trim() &&
      deliveryForm.email.trim() &&
      deliveryForm.phone.trim() &&
      deliveryForm.address.trim() &&
      (/^\d{6}$/.test(deliveryForm.pin.trim()) && (isPinValid || hasManualLocation)) &&
      deliveryForm.city.trim() &&
      deliveryForm.state.trim()
  );

  const STEPS = ['Delivery', 'Payment', 'Review'];

  const handlePlaceOrder = async () => {
    if (!isDeliveryComplete || isPinLoading || isPlacingOrder || sampleItems.length === 0) return;

    setIsPlacingOrder(true);
    setOrderError('');
    try {
      const orderItems = sampleItems.map((item) => ({
        productId: item.id,
        name: item.name,
        image: item.image,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
      }));

      const { id: orderId, orderCode } = await createOrder({
        userId: userId || undefined,
        customerName: `${deliveryForm.firstName} ${deliveryForm.lastName}`.trim(),
        email: deliveryForm.email.trim(),
        phone: deliveryForm.phone.trim(),
        paymentMethod,
        items: orderItems,
        subtotal,
        shipping,
        discount,
        total,
        delivery: {
          firstName: deliveryForm.firstName.trim(),
          lastName: deliveryForm.lastName.trim(),
          email: deliveryForm.email.trim(),
          phone: deliveryForm.phone.trim(),
          address: deliveryForm.address.trim(),
          city: deliveryForm.city.trim(),
          state: deliveryForm.state.trim(),
          pin: deliveryForm.pin.trim(),
        },
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'lastOrderSnapshot',
          JSON.stringify({
            id: orderId,
            orderCode,
            customerName: `${deliveryForm.firstName} ${deliveryForm.lastName}`.trim(),
            email: deliveryForm.email.trim(),
            paymentMethod,
            items: orderItems,
            subtotal,
            shipping,
            discount,
            total,
            createdAtIso: new Date().toISOString(),
          })
        );
      }

      router.push(`/order-success?orderId=${encodeURIComponent(orderId)}`);
    } catch {
      setOrderError('Unable to place order right now. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                      {i + 1 < step ? '1' : i + 1}
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
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-cocoa-800 font-body mb-2">Saved Addresses</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applyAddressById(a.id)}
                          className={`text-left rounded-xl border p-3 transition-colors ${
                            selectedAddressId === a.id && !showAddressForm
                              ? 'border-blush-400 bg-blush-50'
                              : 'border-cream-200 hover:border-cream-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-cocoa-800">{a.label || 'Address'}</p>
                            {a.isDefault && <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">Default</span>}
                          </div>
                          <p className="text-xs text-cocoa-700/70 line-clamp-2">{a.addressLine}, {a.city}, {a.state} - {a.pin}</p>
                          <p className="text-xs text-cocoa-700/60 mt-1">{a.firstName} {a.lastName} · {a.phone}</p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId('');
                          setIsPinTrusted(false);
                          setIsPinValid(false);
                          setPinError('');
                          setShowAddressForm((prev) => !prev);
                        }}
                        className={`rounded-xl border border-dashed p-3 text-left transition-colors ${
                          showAddressForm ? 'border-blush-400 bg-blush-50' : 'border-cream-300 hover:border-blush-300'
                        }`}
                      >
                        <p className="text-sm font-medium text-blush-600">+ Address</p>
                        <p className="text-xs text-cocoa-700/60 mt-1">Add a new delivery address</p>
                      </button>
                    </div>
                  </div>
                  {showAddressForm && (
                    <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, lbl]) => (
                        <div key={lbl}>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">{lbl} *</label>
                          <input
                            value={deliveryForm[key as 'firstName' | 'lastName']}
                            onChange={(e) => setDeliveryForm((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={deliveryForm.email}
                        onChange={(e) => setDeliveryForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        value={deliveryForm.phone}
                        onChange={(e) => setDeliveryForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Address *</label>
                      <textarea
                        rows={2}
                        value={deliveryForm.address}
                        onChange={(e) => setDeliveryForm((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-cocoa-800"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">PIN *</label>
                        <input
                          value={deliveryForm.pin}
                          maxLength={6}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            setIsPinTrusted(false);
                            setDeliveryForm((prev) => ({ ...prev, pin: cleaned }));
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">City *</label>
                        <input
                          value={deliveryForm.city}
                          readOnly={!allowManualLocation}
                          placeholder={allowManualLocation ? 'Enter city' : 'Auto-filled from PIN'}
                          className={`w-full px-4 py-3 rounded-xl border border-cream-200 text-sm font-body focus:outline-none text-cocoa-800 ${allowManualLocation ? 'bg-cream-50 focus:ring-2 focus:ring-blush-300' : 'bg-cream-100'}`}
                          onChange={(e) => setDeliveryForm((prev) => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">State *</label>
                        <input
                          value={deliveryForm.state}
                          readOnly={!allowManualLocation}
                          placeholder={allowManualLocation ? 'Enter state' : 'Auto-filled from PIN'}
                          className={`w-full px-4 py-3 rounded-xl border border-cream-200 text-sm font-body focus:outline-none text-cocoa-800 ${allowManualLocation ? 'bg-cream-50 focus:ring-2 focus:ring-blush-300' : 'bg-cream-100'}`}
                          onChange={(e) => setDeliveryForm((prev) => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      
                    </div>
                    {isPinLoading && <p className="text-xs font-body text-cocoa-700/60">Verifying PIN...</p>}
                    {pinError && <p className="text-xs font-body text-red-600">{pinError}</p>}
                    {!pinError && isPinValid && deliveryForm.pin && (
                      <p className="text-xs font-body text-sage-600">PIN verified successfully.</p>
                    )}
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-cream-50 rounded-xl space-y-3">
                    <p className="text-sm font-medium text-cocoa-800 font-body">Delivery Method</p>
                    {[
                      { id: 'std', label: 'Standard Delivery', sub: '3-5 business days', price: subtotal > 999 ? 'FREE' : '₹99' },
                      { id: 'exp', label: 'Express Delivery', sub: '1-2 business days', price: '₹199' },
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
                  <button
                    onClick={() => {
                      if (!isDeliveryComplete || isPinLoading) return;
                      setStep(2);
                    }}
                    disabled={!isDeliveryComplete || isPinLoading}
                    className="mt-5 w-full py-3.5 bg-blush-500 hover:bg-blush-600 disabled:bg-blush-300 disabled:cursor-not-allowed text-white rounded-full font-medium font-body transition-colors flex items-center justify-center gap-2"
                  >
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
                      { id: 'cod', label: 'Cash on Delivery', icon: <IndianRupee size={18} /> },
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
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || isPinLoading || !isDeliveryComplete}
                      className="flex-1 w-full py-3.5 bg-blush-500 hover:bg-blush-600 disabled:bg-blush-300 disabled:cursor-not-allowed text-white rounded-full font-medium font-body transition-colors flex items-center justify-center gap-2"
                    >
                      {isPlacingOrder ? 'Placing Order...' : `Place Order · ₹${total.toFixed(0)}`} <ChevronRight size={16} />
                    </button>
                  </div>
                  {orderError && <p className="mt-3 text-sm text-red-600 font-body">{orderError}</p>}
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
                  {sampleItems.map(item => (
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
                    ✓ Coupon applied - 10% off!
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
