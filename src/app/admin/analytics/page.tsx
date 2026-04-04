'use client';
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Eye, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const WEEKLY = [
  { day: 'Mon', orders: 18, revenue: 12400 },
  { day: 'Tue', orders: 24, revenue: 16800 },
  { day: 'Wed', orders: 31, revenue: 21700 },
  { day: 'Thu', orders: 22, revenue: 15400 },
  { day: 'Fri', orders: 38, revenue: 26600 },
  { day: 'Sat', orders: 45, revenue: 31500 },
  { day: 'Sun', orders: 29, revenue: 20300 },
];

const maxRevenue = Math.max(...WEEKLY.map(w => w.revenue));

const TRAFFIC = [
  { source: 'Organic Search', visits: 4231, pct: 42, change: '+8%', up: true },
  { source: 'Direct', visits: 2018, pct: 20, change: '+3%', up: true },
  { source: 'Social Media', visits: 1813, pct: 18, change: '+15%', up: true },
  { source: 'Referral', visits: 1205, pct: 12, change: '-2%', up: false },
  { source: 'Email', visits: 805, pct: 8, change: '+6%', up: true },
];

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-500 font-body">Performance overview for March 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-sm font-body text-slate-600 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
            <button className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', val: '₹1,44,700', change: '+18.2%', up: true, icon: DollarSign, color: 'bg-blush-50 text-blush-600' },
            { label: 'Total Orders', val: '207', change: '+12.5%', up: true, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
            { label: 'Store Visitors', val: '10,073', change: '+9.8%', up: true, icon: Eye, color: 'bg-purple-50 text-purple-600' },
            { label: 'New Customers', val: '86', change: '-3.2%', up: false, icon: Users, color: 'bg-amber-50 text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                  <s.icon size={18} />
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
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-display text-lg text-slate-800 mb-6">Weekly Revenue</h2>
            <div className="flex items-end gap-3 h-48">
              {WEEKLY.map(day => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-400 font-body">₹{(day.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t-lg relative group cursor-pointer transition-all duration-300"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, background: 'linear-gradient(to top, #ef8fa6, #f4a7b9)' }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.orders} orders · ₹{day.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-body">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-body text-slate-500">
              <span>Total orders this week: <strong className="text-slate-800">207</strong></span>
              <span>Total revenue: <strong className="text-slate-800">₹1,44,700</strong></span>
            </div>
          </div>

          {/* Conversion funnel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-display text-lg text-slate-800 mb-5">Conversion Funnel</h2>
            <div className="space-y-3">
              {[
                { label: 'Visitors', val: 10073, pct: 100, color: 'bg-slate-200' },
                { label: 'Product Views', val: 7251, pct: 72, color: 'bg-blue-200' },
                { label: 'Added to Cart', val: 2891, pct: 29, color: 'bg-amber-200' },
                { label: 'Checkout Started', val: 1436, pct: 14, color: 'bg-blush-300' },
                { label: 'Orders Placed', val: 207, pct: 2, color: 'bg-sage-400' },
              ].map(f => (
                <div key={f.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-600 font-body">{f.label}</span>
                    <span className="text-xs text-slate-500 font-body">{f.val.toLocaleString()} ({f.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={`${f.color} h-2.5 rounded-full`} style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Traffic sources */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-display text-lg text-slate-800 mb-5">Traffic Sources</h2>
            <div className="space-y-4">
              {TRAFFIC.map(t => (
                <div key={t.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-body text-slate-700">{t.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-body text-slate-500">{t.visits.toLocaleString()}</span>
                      <span className={`text-xs font-body font-medium ${t.up ? 'text-green-600' : 'text-red-500'}`}>{t.change}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blush-300 h-2 rounded-full" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-display text-lg text-slate-800 mb-5">Top Pages</h2>
            <div className="space-y-3">
              {[
                { page: '/products', views: 3241, bounce: '32%' },
                { page: '/', views: 2918, bounce: '28%' },
                { page: '/products/1', views: 1456, bounce: '41%' },
                { page: '/products/3', views: 1123, bounce: '38%' },
                { page: '/about', views: 891, bounce: '52%' },
                { page: '/cart', views: 756, bounce: '24%' },
              ].map((p, i) => (
                <div key={p.page} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400 font-body w-4">{i + 1}</span>
                  <span className="flex-1 text-sm font-body text-slate-700 font-medium">{p.page}</span>
                  <span className="text-sm font-body text-slate-500">{p.views.toLocaleString()}</span>
                  <span className="text-xs font-body text-slate-400 w-10 text-right">{p.bounce}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
