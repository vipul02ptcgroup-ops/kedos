'use client';
import { useEffect, useState } from 'react';
import { Store, Bell, Shield, CreditCard, Truck, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  DEFAULT_ADMIN_SETTINGS,
  type AdminSettings,
  saveAdminSettings,
  subscribeAdminSettings,
} from '@/lib/adminSettings';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

const TABS = [
  { id: 'store', label: 'Store Info', icon: Store },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('store');
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub = subscribeAdminSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveAdminSettings(settings);
      await createAdminLog({
        action: 'settings_saved',
        ...getAdminActorSnapshot(),
        details: `Tab=${tab}`,
      });
      setMessage('Settings saved successfully.');
    } catch (err: any) {
      setMessage(err?.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 font-body">Manage your store configuration</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-colors text-left ${
                    tab === t.id ? 'bg-blush-50 text-blush-600' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {loading && <p className="text-sm text-slate-500 font-body">Loading settings...</p>}

            {!loading && tab === 'store' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Store Information</h2>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Store Name</label>
                    <input value={settings.store.storeName} onChange={(e) => setSettings((p) => ({ ...p, store: { ...p.store, storeName: e.target.value } }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Tagline</label>
                    <input value={settings.store.tagline} onChange={(e) => setSettings((p) => ({ ...p, store: { ...p.store, tagline: e.target.value } }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Email</label>
                    <input value={settings.store.email} onChange={(e) => setSettings((p) => ({ ...p, store: { ...p.store, email: e.target.value } }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Phone</label>
                    <input value={settings.store.phone} onChange={(e) => setSettings((p) => ({ ...p, store: { ...p.store, phone: e.target.value } }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Address</label>
                    <textarea rows={2} value={settings.store.address} onChange={(e) => setSettings((p) => ({ ...p, store: { ...p.store, address: e.target.value } }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {!loading && tab === 'notifications' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Notification Preferences</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { key: 'newOrder', label: 'New Order', desc: 'Receive email when a new order is placed' },
                    { key: 'lowStockAlert', label: 'Low Stock Alert', desc: 'Alert when product stock falls below 5' },
                    { key: 'customerSignup', label: 'Customer Signup', desc: 'Notify when a new customer registers' },
                    { key: 'paymentFailed', label: 'Payment Failed', desc: 'Alert on failed payment attempts' },
                    { key: 'reviewPosted', label: 'Review Posted', desc: 'Notify when a customer leaves a review' },
                    { key: 'returnRequest', label: 'Return Request', desc: 'Alert when a return is requested' },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-800 font-body">{n.label}</div>
                        <div className="text-xs text-slate-500 font-body">{n.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[n.key as keyof AdminSettings['notifications']]}
                          onChange={(e) => setSettings((p) => ({ ...p, notifications: { ...p.notifications, [n.key]: e.target.checked } }))}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && tab === 'shipping' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Shipping Settings</h2>
                <div className="space-y-5 max-w-xl">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <h3 className="text-sm font-medium text-slate-800 font-body">Free Shipping Threshold</h3>
                    <input type="number" value={settings.shipping.freeShippingThreshold}
                      onChange={(e) => setSettings((p) => ({ ...p, shipping: { ...p.shipping, freeShippingThreshold: Number(e.target.value || 0) } }))}
                      className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm font-body text-slate-800 focus:outline-none" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div className="text-sm font-medium text-slate-800 font-body">Standard Shipping</div>
                      <input type="number" value={settings.shipping.standardPrice}
                        onChange={(e) => setSettings((p) => ({ ...p, shipping: { ...p.shipping, standardPrice: Number(e.target.value || 0) } }))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-body text-slate-800 text-right focus:outline-none" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div className="text-sm font-medium text-slate-800 font-body">Express Shipping</div>
                      <input type="number" value={settings.shipping.expressPrice}
                        onChange={(e) => setSettings((p) => ({ ...p, shipping: { ...p.shipping, expressPrice: Number(e.target.value || 0) } }))}
                        className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-body text-slate-800 text-right focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && tab === 'payment' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Payment Methods</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { key: 'razorpay', name: 'Razorpay', desc: 'Cards, UPI, Net Banking' },
                    { key: 'cod', name: 'Cash on Delivery', desc: 'Pay when order arrives' },
                    { key: 'paypal', name: 'PayPal', desc: 'International payments' },
                  ].map((pm) => (
                    <div key={pm.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-slate-800 font-body">{pm.name}</div>
                        <div className="text-xs text-slate-500 font-body">{pm.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.payment[pm.key as keyof AdminSettings['payment']]}
                          onChange={(e) => setSettings((p) => ({ ...p, payment: { ...p.payment, [pm.key]: e.target.checked } }))}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && tab === 'security' && (
              <div>
                <h2 className="font-display text-lg text-slate-800 mb-5">Security Settings</h2>
                <div className="space-y-4 max-w-xl">
                  {[
                    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add extra security to your account' },
                    { key: 'loginNotifications', label: 'Login Notifications', desc: 'Get notified of new login attempts' },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-slate-800 font-body">{opt.label}</div>
                        <div className="text-xs text-slate-500 font-body">{opt.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security[opt.key as keyof AdminSettings['security']]}
                          onChange={(e) => setSettings((p) => ({ ...p, security: { ...p.security, [opt.key]: e.target.checked } }))}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blush-500 rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              {message && <span className="text-sm text-green-600 font-body">{message}</span>}
              <div className="ml-auto">
                <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm font-body transition-colors disabled:bg-blush-300">
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
