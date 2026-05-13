'use client';
import { useState } from 'react';
import { Store, Bell, Shield, CreditCard, Truck, Globe, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const TABS = [
  { id: 'store', label: 'Store Info', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('store');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 font-body">Manage your store configuration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-colors text-left ${
                    tab === t.id ? 'bg-blush-50 text-blush-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {tab === 'store' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Store Information</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { label: 'Store Name', val: 'Kedos', ph: 'Store name' },
                    { label: 'Tagline', val: 'Baby Boutique', ph: 'Tagline' },
                    { label: 'Email', val: 'ptcvirar@gmail.com', ph: 'Store email' },
                    { label: 'Phone', val: '+91 91208 79879', ph: 'Phone number' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">{f.label}</label>
                      <input defaultValue={f.val} placeholder={f.ph}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Address</label>
                    <textarea rows={2} defaultValue="Virar (East), Maharashtra, India, Mumbai 400053"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Store Logo</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-blush-100 rounded-xl flex items-center justify-center">
                        <span className="font-display text-xl text-blush-600">T</span>
                      </div>
                      <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-body text-slate-600 hover:bg-slate-50 transition-colors">Change Logo</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Notification Preferences</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { label: 'New Order', desc: 'Receive email when a new order is placed' },
                    { label: 'Low Stock Alert', desc: 'Alert when product stock falls below 5' },
                    { label: 'Customer Signup', desc: 'Notify when a new customer registers' },
                    { label: 'Payment Failed', desc: 'Alert on failed payment attempts' },
                    { label: 'Review Posted', desc: 'Notify when a customer leaves a review' },
                    { label: 'Return Request', desc: 'Alert when a return is requested' },
                  ].map(n => (
                    <div key={n.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-800 font-body">{n.label}</div>
                        <div className="text-xs text-slate-500 font-body">{n.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'shipping' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Shipping Settings</h2>
                <div className="space-y-5 max-w-xl">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <h3 className="text-sm font-medium text-slate-800 font-body">Free Shipping Threshold</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-body text-slate-600">Orders above</span>
                      <input defaultValue="999" type="number" className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm font-body text-slate-800 focus:outline-none" />
                      <span className="text-sm font-body text-slate-600">₹ get free shipping</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Standard Shipping', price: 99, days: '3–5 days' },
                      { label: 'Express Shipping', price: 199, days: '1–2 days' },
                    ].map(opt => (
                      <div key={opt.label} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{opt.label}</div>
                          <div className="text-xs text-slate-500 font-body">{opt.days}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-body text-slate-600">₹</span>
                          <input defaultValue={opt.price} type="number" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-body text-slate-800 text-right focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'payment' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Payment Methods</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { name: 'Razorpay', desc: 'Cards, UPI, Net Banking', enabled: true },
                    { name: 'Cash on Delivery', desc: 'Pay when order arrives', enabled: true },
                    { name: 'PayPal', desc: 'International payments', enabled: false },
                  ].map(pm => (
                    <div key={pm.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-slate-800 font-body">{pm.name}</div>
                        <div className="text-xs text-slate-500 font-body">{pm.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={pm.enabled} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'security' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Security Settings</h2>
                <div className="space-y-5 max-w-xl">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-700 font-body">Change Password</h3>
                    {['Current Password', 'New Password', 'Confirm New Password'].map(f => (
                      <div key={f}>
                        <label className="block text-sm text-slate-600 font-body mb-1.5">{f}</label>
                        <input type="password" placeholder="••••••••"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    {[
                      { label: 'Two-Factor Authentication', desc: 'Add extra security to your account' },
                      { label: 'Login Notifications', desc: 'Get notified of new login attempts' },
                    ].map(opt => (
                      <div key={opt.label} className="flex items-center justify-between py-2">
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{opt.label}</div>
                          <div className="text-xs text-slate-500 font-body">{opt.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              {saved && <span className="text-sm text-green-600 font-body">✓ Settings saved!</span>}
              <div className="ml-auto">
                <button onClick={handleSave} className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
                  <Save size={15} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
