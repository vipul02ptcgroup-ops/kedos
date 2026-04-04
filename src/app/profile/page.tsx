'use client';
import { useState } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, ChevronRight, Package, Star, Edit3 } from 'lucide-react';
import { ORDERS } from '@/lib/data';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream-50">
        {/* Profile header */}
        <div className="bg-cocoa-800 pt-10 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blush-300 flex items-center justify-center ring-4 ring-cocoa-700">
                <span className="font-display text-3xl text-white">A</span>
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-blush-500 rounded-full flex items-center justify-center shadow-md">
                <Edit3 size={12} className="text-white" />
              </button>
            </div>
            <div className="text-center sm:text-left sm:pb-2">
              <h1 className="font-display text-2xl text-cream-100">Guest</h1>
              <p className="text-cream-200/60 font-body text-sm">guest@example.com · Member since Jan 2023</p>
            </div>
            <div className="sm:ml-auto flex gap-4 text-center sm:pb-2">
              {[['0', 'Orders'], ['0', 'Wishlist'], ['0', 'Addresses']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="font-display text-xl text-cream-100">{val}</div>
                  <div className="text-xs text-cream-200/50 font-body">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium font-body transition-colors whitespace-nowrap
                    ${activeTab === tab ? 'bg-blush-500 text-white' : 'text-cocoa-700/70 hover:bg-cream-100'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {activeTab === 'Overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: ShoppingBag, label: 'Total Orders', val: '0', color: 'bg-blush-100 text-blush-600' },
                { icon: Package, label: 'In Transit', val: '0', color: 'bg-sky-100 text-sky-600' },
                { icon: Heart, label: 'Wishlist', val: '0', color: 'bg-pink-100 text-pink-600' },
                { icon: Star, label: 'Reviews Given', val: '0', color: 'bg-amber-100 text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center`}>
                    <s.icon size={22} />
                  </div>
                  <div>
                    <div className="font-display text-2xl text-cocoa-800">{s.val}</div>
                    <div className="text-xs text-cocoa-700/60 font-body">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Orders */}
          {(activeTab === 'Overview' || activeTab === 'Orders') && (
            <div className="bg-white rounded-2xl shadow-sm mb-6">
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-lg text-cocoa-800">Recent Orders</h2>
                {activeTab === 'Overview' && (
                  <button onClick={() => setActiveTab('Orders')} className="text-sm text-blush-500 font-body hover:text-blush-600 flex items-center gap-1">
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cream-50">
                    <tr>
                      {['Order', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-cocoa-700/60 font-body uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {ORDERS.slice(0, activeTab === 'Overview' ? 3 : undefined).map(order => (
                      <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-cocoa-800 font-body">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-cocoa-700/60 font-body">{order.date}</td>
                        <td className="px-6 py-4 text-sm text-cocoa-700/60 font-body">{order.items} items</td>
                        <td className="px-6 py-4 text-sm font-display text-cocoa-800">₹{order.total.toFixed(0)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-body capitalize ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-xs text-blush-500 hover:text-blush-600 font-body">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'Addresses' && (
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {[
                { label: 'Home', address: '', default: true },
                { label: 'Office', address: '', default: false },
              ].map(addr => (
                <div key={addr.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-blush-500" />
                      <span className="font-medium text-sm text-cocoa-800 font-body">{addr.label}</span>
                      {addr.default && <span className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-body">Default</span>}
                    </div>
                    <button className="text-xs text-blush-500 font-body hover:text-blush-600">Edit</button>
                  </div>
                  <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{addr.address}</p>
                </div>
              ))}
              <button className="border-2 border-dashed border-cream-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blush-300 hover:bg-blush-50 transition-colors group">
                <MapPin size={24} className="text-cream-300 group-hover:text-blush-400 mb-2 transition-colors" />
                <span className="text-sm font-medium text-cocoa-700/50 font-body group-hover:text-blush-600">Add New Address</span>
              </button>
            </div>
          )}

          {/* Settings */}4
          {activeTab === 'Settings' && (
            <div className="bg-white rounded-2xl shadow-sm mb-6 p-6">
              <h2 className="font-display text-lg text-cocoa-800 mb-6">Account Settings</h2>
              <div className="space-y-5 max-w-lg">
                {[
                  { label: 'First Name', val: 'Anjali' },
                  { label: 'Last Name', val: 'Sharma' },
                  { label: 'Email', val: 'anjali@example.com' },
                  { label: 'Phone', val: '+91 91208 79879' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">{f.label}</label>
                    <input defaultValue={f.val}
                      className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                  </div>
                ))}
                <button className="px-8 py-3 bg-blush-500 text-white rounded-full font-medium font-body text-sm hover:bg-blush-600 transition-colors">
                  Save Changes
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-cream-200">
                <h3 className="font-display text-base text-red-600 mb-4">Danger Zone</h3>
                <button className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-body">
                  <LogOut size={15} /> Sign out of all devices
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
