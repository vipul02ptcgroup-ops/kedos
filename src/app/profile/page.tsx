'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, MapPin, LogOut, ChevronRight, Package, Star, Edit3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getUserProfile, logoutUser, subscribeAuth, updateUserSettings } from '@/lib/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeOrdersForUserIdentity, type FirestoreOrder } from '@/lib/orders';
import { subscribeUserWishlistProductIds, addToWishlist, removeFromWishlist } from '@/lib/wishlist';
import { subscribeProducts } from '@/lib/products';
import { Product } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import {
  UserAddress,
  addUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  subscribeUserAddresses,
  updateUserAddress,
} from '@/lib/addresses';

const TABS = ['Overview', 'Orders', 'Wishlist', 'Addresses', 'Settings'];
const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-sage-100 text-sage-700',
  shipped: 'bg-sky-100 text-sky-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-cream-200 text-cocoa-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const searchParams = useSearchParams();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine: '',
    pin: '',
    city: '',
    state: '',
    isDefault: true,
  });
  const [editingAddressId, setEditingAddressId] = useState('');
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fullName = (profileName || user?.displayName || 'Customer').trim();
  const userEmail = user?.email || '';
  const userPhone = profilePhone || user?.phoneNumber || '';
  const totalOrders = orders.length;
  const inTransitOrders = orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length;
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  useEffect(() => {
    const tab = (searchParams.get('tab') || '').trim();
    if (!tab) return;
    const match = TABS.find((t) => t.toLowerCase() === tab.toLowerCase());
    if (match) setActiveTab(match);
  }, [searchParams]);

  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      setUser(u);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setProfileName('');
      setProfilePhone('');
      return;
    }

    const fetchProfile = async () => {
      const profile = await getUserProfile(user.uid).catch(() => null);
      if (profile?.name) setProfileName(String(profile.name));
      if (profile?.phone) setProfilePhone(String(profile.phone));
    };
    fetchProfile();

    const unsubOrders = subscribeOrdersForUserIdentity(
      { userId: user.uid, email: user.email },
      setOrders
    );
    const unsubWishlist = subscribeUserWishlistProductIds(user.uid, setWishlistIds);
    const unsubAddresses = subscribeUserAddresses(user.uid, setAddresses);
    return () => {
      unsubOrders();
      unsubWishlist();
      unsubAddresses();
    };
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    const isWishlisted = wishlistIds.includes(productId);
    if (isWishlisted) await removeFromWishlist(user.uid, productId);
    else await addToWishlist(user, productId);
  };

  useEffect(() => {
    setSettingsName(fullName || '');
  }, [fullName]);

  useEffect(() => {
    setSettingsEmail(userEmail || '');
  }, [userEmail]);

  useEffect(() => {
    setSettingsPhone(userPhone || '');
  }, [userPhone]);

  const handleSaveSettings = async () => {
    if (!user) return;
    const name = settingsName.trim();
    const phone = settingsPhone.trim();

    if (!name) {
      setSettingsError('Name is required.');
      setSettingsMessage('');
      return;
    }

    setIsSavingSettings(true);
    setSettingsError('');
    setSettingsMessage('');
    try {
      await updateUserSettings({ user, name, phone });
      setProfileName(name);
      setProfilePhone(phone);
      setSettingsMessage('Settings saved successfully.');
    } catch {
      setSettingsError('Unable to save settings right now. Please try again.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logoutUser();
    } finally {
      setIsSigningOut(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Home',
      firstName: profileName.split(' ')[0] || '',
      lastName: profileName.split(' ').slice(1).join(' ') || '',
      phone: profilePhone || user?.phoneNumber || '',
      addressLine: '',
      pin: '',
      city: '',
      state: '',
      isDefault: addresses.length === 0,
    });
    setEditingAddressId('');
  };

  const startEditAddress = (address: UserAddress) => {
    setAddressForm({
      label: address.label || 'Home',
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      phone: address.phone || '',
      addressLine: address.addressLine || '',
      pin: address.pin || '',
      city: address.city || '',
      state: address.state || '',
      isDefault: Boolean(address.isDefault),
    });
    setEditingAddressId(address.id);
  };

  const saveAddress = async () => {
    if (!user) return;
    if (
      !addressForm.firstName.trim() ||
      !addressForm.lastName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.addressLine.trim() ||
      !addressForm.pin.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim()
    ) {
      window.alert('Please fill all address fields.');
      return;
    }
    if (!isPinValid) {
      window.alert('Please enter a valid PIN before saving address.');
      return;
    }

    const payload = {
      label: addressForm.label.trim() || 'Home',
      firstName: addressForm.firstName.trim(),
      lastName: addressForm.lastName.trim(),
      phone: addressForm.phone.trim(),
      addressLine: addressForm.addressLine.trim(),
      pin: addressForm.pin.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      isDefault: addressForm.isDefault,
    };

    if (editingAddressId) await updateUserAddress(user.uid, editingAddressId, payload);
    else await addUserAddress(user.uid, payload);
    resetAddressForm();
  };

  useEffect(() => {
    const pin = addressForm.pin.trim();
    if (!pin) {
      setPinError('');
      setIsPinValid(false);
      setAddressForm((prev) => ({ ...prev, city: '', state: '' }));
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setPinError('PIN must be 6 digits.');
      setIsPinValid(false);
      setAddressForm((prev) => ({ ...prev, city: '', state: '' }));
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        setIsPinLoading(true);
        setPinError('');
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        const postOffice = data?.[0]?.PostOffice?.[0];
        if (cancelled) return;

        if (!postOffice || data?.[0]?.Status !== 'Success') {
          setIsPinValid(false);
          setPinError('Invalid PIN code. Please enter a valid PIN.');
          setAddressForm((prev) => ({ ...prev, city: '', state: '' }));
          return;
        }

        const city = (postOffice.District || '').trim();
        const state = (postOffice.State || '').trim();
        if (!city || !state) {
          setIsPinValid(false);
          setPinError('Could not fetch city/state for this PIN.');
          setAddressForm((prev) => ({ ...prev, city: '', state: '' }));
          return;
        }

        setAddressForm((prev) => ({ ...prev, city, state }));
        setIsPinValid(true);
      } catch {
        if (cancelled) return;
        setIsPinValid(false);
        setPinError('Unable to verify PIN right now. Please try again.');
        setAddressForm((prev) => ({ ...prev, city: '', state: '' }));
      } finally {
        if (!cancelled) setIsPinLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [addressForm.pin]);

  if (checkingAuth) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 flex items-center justify-center">
          <p className="text-cocoa-700/70 font-body">Checking account...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
            <h1 className="font-display text-2xl text-cocoa-800 mb-2">Login Required</h1>
            <p className="text-sm text-cocoa-700/70 font-body mb-6">Please login to view your profile.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="px-5 py-2.5 rounded-full bg-blush-500 text-white text-sm font-body font-medium hover:bg-blush-600">Login</Link>
              <Link href="/register" className="px-5 py-2.5 rounded-full border border-cream-300 text-cocoa-700 text-sm font-body font-medium hover:bg-cream-100">Register</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50">
        <div className="bg-cocoa-800 pt-10 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blush-300 flex items-center justify-center ring-4 ring-cocoa-700">
                <span className="font-display text-3xl text-white">{(fullName || userEmail || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-blush-500 rounded-full flex items-center justify-center shadow-md">
                <Edit3 size={12} className="text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left sm:pb-2">
              <h1 className="font-display text-2xl text-cream-100">{fullName}</h1>
              <p className="text-cream-200/60 font-body text-sm">{userEmail || '-'}</p>
              {userPhone && <p className="text-cream-200/50 font-body text-xs mt-0.5">{userPhone}</p>}
            </div>
            <div className="sm:ml-auto flex gap-4 text-center sm:pb-2">
              {[[String(totalOrders), 'Orders'], [String(wishlistProducts.length), 'Wishlist'], [String(addresses.length), 'Addresses']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="font-display text-xl text-cream-100">{val}</div>
                  <div className="text-xs text-cream-200/50 font-body">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium font-body transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-blush-500 text-white' : 'text-cocoa-700/70 hover:bg-cream-100'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'Overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: ShoppingBag, label: 'Total Orders', val: String(totalOrders), color: 'bg-blush-100 text-blush-600' },
                { icon: Package, label: 'In Transit', val: String(inTransitOrders), color: 'bg-sky-100 text-sky-600' },
                { icon: Heart, label: 'Wishlist', val: String(wishlistProducts.length), color: 'bg-pink-100 text-pink-600' },
                { icon: Star, label: 'Reviews Given', val: '0', color: 'bg-amber-100 text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}><s.icon size={22} /></div>
                  <div><div className="font-display text-2xl text-cocoa-800">{s.val}</div><div className="text-xs text-cocoa-700/60 font-body">{s.label}</div></div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'Overview' || activeTab === 'Orders') && (
            <div className="bg-white rounded-2xl shadow-sm mb-6">
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-lg text-cocoa-800">Recent Orders</h2>
                {activeTab === 'Overview' && (
                  <button onClick={() => setActiveTab('Orders')} className="text-sm text-blush-500 font-body hover:text-blush-600 flex items-center gap-1">View all <ChevronRight size={14} /></button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cream-50"><tr>{['Order', 'Date', 'Items', 'Total', 'Status', ''].map(h => (<th key={h} className="px-6 py-3 text-left text-xs font-medium text-cocoa-700/60 font-body uppercase tracking-wide">{h}</th>))}</tr></thead>
                  <tbody className="divide-y divide-cream-100">
                    {orders.slice(0, activeTab === 'Overview' ? 3 : undefined).map(order => (
                      <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-cocoa-800 font-body">#{order.orderCode || order.id}</td>
                        <td className="px-6 py-4 text-sm text-cocoa-700/60 font-body">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-cocoa-700/60 font-body">{order.itemsCount || order.items?.length || 0} items</td>
                        <td className="px-6 py-4 text-sm font-display text-cocoa-800">Rs {Number(order.total || 0).toFixed(0)}</td>
                        <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium font-body capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>{order.status}</span></td>
                        <td className="px-6 py-4 text-right"><Link href={`/profile/orders/${order.id}`} className="text-xs text-blush-500 hover:text-blush-600 font-body">Details</Link></td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-cocoa-700/60 font-body">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Wishlist' && (
            <div className="mb-6">
              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <p className="text-sm text-cocoa-700/70 font-body">No wishlist items yet.</p>
                  <Link href="/products" className="inline-flex mt-4 px-5 py-2.5 rounded-full bg-blush-500 text-white text-sm font-body font-medium hover:bg-blush-600">Browse Products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {wishlistProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Addresses' && (
            <div className="grid lg:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="font-display text-lg text-cocoa-800">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input value={addressForm.label} onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="Label (Home/Office)" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" />
                  <input value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" />
                  <input value={addressForm.firstName} onChange={(e) => setAddressForm((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="First name" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" />
                  <input value={addressForm.lastName} onChange={(e) => setAddressForm((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="Last name" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" />
                </div>
                <textarea value={addressForm.addressLine} onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))} rows={3} placeholder="Full address" className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm resize-none" />
                <div className="grid grid-cols-3 gap-3">
                  <input value={addressForm.pin} onChange={(e) => setAddressForm((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="PIN" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-sm" />
                  <input value={addressForm.city} readOnly placeholder="City (auto-filled)" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-100 text-sm" />
                  <input value={addressForm.state} readOnly placeholder="State (auto-filled)" className="px-3 py-2.5 rounded-xl border border-cream-200 bg-cream-100 text-sm" />
                </div>
                {isPinLoading && <p className="text-xs font-body text-cocoa-700/60">Verifying PIN...</p>}
                {pinError && <p className="text-xs font-body text-red-600">{pinError}</p>}
                {!pinError && isPinValid && addressForm.pin && <p className="text-xs font-body text-sage-600">PIN verified successfully.</p>}
                <label className="flex items-center gap-2 text-sm text-cocoa-700">
                  <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))} className="accent-blush-500" />
                  Set as default address
                </label>
                <div className="flex gap-2">
                  <button onClick={saveAddress} className="px-5 py-2.5 rounded-full bg-blush-500 text-white text-sm font-medium">{editingAddressId ? 'Update Address' : 'Add Address'}</button>
                  {editingAddressId && <button onClick={resetAddressForm} className="px-5 py-2.5 rounded-full border border-cream-300 text-sm">Cancel</button>}
                </div>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">No address added yet.</p>
                  </div>
                )}
                {addresses.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blush-500" />
                        <span className="font-medium text-sm text-cocoa-800 font-body">{a.label || 'Address'}</span>
                        {a.isDefault && <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">Default</span>}
                      </div>
                      <div className="flex gap-3 text-xs">
                        {!a.isDefault && <button onClick={() => user && setDefaultUserAddress(user.uid, a.id)} className="text-sage-600">Set default</button>}
                        <button onClick={() => startEditAddress(a)} className="text-blush-500">Edit</button>
                        <button onClick={() => user && deleteUserAddress(user.uid, a.id)} className="text-red-500">Delete</button>
                      </div>
                    </div>
                    <p className="text-sm text-cocoa-700/80 font-body">{a.firstName} {a.lastName}</p>
                    <p className="text-sm text-cocoa-700/70 font-body">{a.phone}</p>
                    <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{a.addressLine}, {a.city}, {a.state} - {a.pin}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
              <h2 className="font-display text-lg text-cocoa-800 mb-6">Account Settings</h2>
              <div className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Name</label>
                  <input
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email</label>
                  <input
                    value={settingsEmail}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-100 text-sm font-body text-cocoa-700/70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Phone</label>
                  <input
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body"
                  />
                </div>
                {settingsError && <p className="text-sm text-red-600 font-body">{settingsError}</p>}
                {settingsMessage && <p className="text-sm text-sage-600 font-body">{settingsMessage}</p>}
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-8 py-3 bg-blush-500 text-white rounded-full font-medium font-body text-sm hover:bg-blush-600 transition-colors disabled:bg-blush-300 disabled:cursor-not-allowed"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-cream-200">
                <h3 className="font-display text-base text-red-600 mb-4">Danger Zone</h3>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-body disabled:text-red-300 disabled:cursor-not-allowed"
                >
                  <LogOut size={15} /> {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
