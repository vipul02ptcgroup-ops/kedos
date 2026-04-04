'use client';
import { TrendingUp, TrendingDown, ShoppingBag, Users, Package, DollarSign, Eye, Star, ArrowUpRight } from 'lucide-react';
import { ORDERS, PRODUCTS, CUSTOMERS } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const STATS = [
  { label: 'Total Revenue', val: '₹84,231', change: '+12.5%', up: true, icon: DollarSign, color: 'bg-blush-50 text-blush-600', border: 'border-blush-200' },
  { label: 'Total Orders', val: '1,248', change: '+8.2%', up: true, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
  { label: 'Active Customers', val: '3,891', change: '+15.3%', up: true, icon: Users, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
  { label: 'Avg. Order Value', val: '₹675', change: '-2.1%', up: false, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
];

const MONTHLY = [
  { month: 'Oct', val: 62 }, { month: 'Nov', val: 75 }, { month: 'Dec', val: 95 },
  { month: 'Jan', val: 80 }, { month: 'Feb', val: 88 }, { month: 'Mar', val: 100 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Good morning, Admin 👋</h1>
            <p className="text-sm text-slate-500 font-body mt-0.5">Here's what's happening with your store today.</p>
          </div>
          <div className="text-sm text-slate-500 font-body hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                  <s.icon size={20} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium font-body ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
                </span>
              </div>
              <div className="font-display text-2xl text-slate-800 mb-0.5">{s.val}</div>
              <div className="text-xs text-slate-500 font-body">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-slate-800">Revenue Overview</h2>
              <select className="text-xs font-body text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {MONTHLY.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-body text-slate-500">₹{m.val}k</span>
                  <div className="w-full rounded-t-lg bg-blush-200 hover:bg-blush-400 transition-colors cursor-pointer relative group"
                    style={{ height: `${m.val}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{m.val},000
                    </div>
                  </div>
                  <span className="text-xs font-body text-slate-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-display text-lg text-slate-800 mb-5">Top Categories</h2>
            <div className="space-y-4">
              {[
                { name: 'Clothing', pct: 35, val: '₹29.5k', color: 'bg-blush-400' },
                { name: 'Toys', pct: 28, val: '₹23.6k', color: 'bg-sky-400' },
                { name: 'Nursery', pct: 18, val: '₹15.2k', color: 'bg-sage-400' },
                { name: 'Gear', pct: 12, val: '₹10.1k', color: 'bg-amber-400' },
                { name: 'Other', pct: 7, val: '₹5.9k', color: 'bg-slate-300' },
              ].map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-body text-slate-700">{cat.name}</span>
                    <span className="text-xs font-body text-slate-500">{cat.val} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${cat.color} h-2 rounded-full transition-all`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display text-lg text-slate-800">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-blush-500 hover:text-blush-600 font-body flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-2">
              {ORDERS.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-display text-slate-600">{order.customer[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 font-body truncate">{order.customer}</div>
                    <div className="text-xs text-slate-400 font-body">{order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display text-slate-800">₹{order.total.toFixed(0)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-body capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock + top products */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display text-lg text-slate-800">Top Products</h2>
              <Link href="/admin/products" className="text-xs text-blush-500 hover:text-blush-600 font-body flex items-center gap-1">
                Manage <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-2">
              {PRODUCTS.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <span className="text-sm font-body text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 font-body line-clamp-1">{p.name}</div>
                    <div className="flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-slate-400 font-body">{p.rating} ({p.reviews})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display text-slate-800">₹{p.price}</div>
                    <div className={`text-[10px] font-body ${p.inStock ? 'text-green-600' : 'text-red-500'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
