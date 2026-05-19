'use client';
import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, Star, ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { subscribeProducts } from '@/lib/products';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type DashboardOrder = {
  id: string;
  orderCode: string;
  customer: string;
  status: string;
  total: number;
  dateLabel: string;
};

type DashboardUser = {
  role: string;
};

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseOrder(docId: string, data: any): DashboardOrder {
  const customer = String(data?.customer || data?.customerName || data?.email || 'Customer');
  const status = String(data?.status || 'pending').toLowerCase();
  const total = toNumber(data?.total);
  const rawDate = data?.date;
  const dateLabel = rawDate
    ? String(rawDate)
    : data?.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleDateString('en-IN')
      : 'N/A';

  return {
    id: docId,
    orderCode: String(data?.orderCode || docId),
    customer,
    status,
    total,
    dateLabel,
  };
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => setOrders(snap.docs.map((d) => parseOrder(d.id, d.data()))),
      () => setOrders([])
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => setUsers(snap.docs.map((d) => ({ role: String(d.data()?.role || 'customer') }))),
      () => setUsers([])
    );

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const activeCustomers = users.filter((u) => u.role !== 'admin').length;

  const categoryStats = useMemo(() => {
    if (products.length === 0) return [] as { name: string; pct: number; val: string; color: string }[];

    const totals = products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.price;
      return acc;
    }, {});

    const categoryRevenue = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
    const palette = ['bg-blush-400', 'bg-sky-400', 'bg-sage-400', 'bg-amber-400', 'bg-slate-300'];

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount], idx) => ({
        name,
        pct: Math.max(1, Math.round((amount / categoryRevenue) * 100)),
        val: `Rs ${amount.toFixed(0)}`,
        color: palette[idx % palette.length],
      }));
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
      .slice(0, 5);
  }, [products]);

  const monthly = useMemo(() => {
    const now = new Date();
    const map = new Map<string, number>();

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, 0);
    }

    orders.forEach((o) => {
      const d = new Date(o.dateLabel);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + o.total);
      }
    });

    const max = Math.max(...Array.from(map.values()), 1);

    return Array.from(map.entries()).map(([key, revenue]) => {
      const [year, month] = key.split('-').map(Number);
      const label = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'short' });
      return {
        month: label,
        revenue,
        height: Math.max(8, Math.round((revenue / max) * 100)),
      };
    });
  }, [orders]);

  const stats = [
    {
      label: 'Total Revenue',
      val: `Rs ${totalRevenue.toFixed(0)}`,
      change: totalRevenue > 0 ? '+Live' : 'No data',
      up: totalRevenue > 0,
      icon: DollarSign,
      color: 'bg-blush-50 text-blush-600',
      border: 'border-blush-200',
    },
    {
      label: 'Total Orders',
      val: String(totalOrders),
      change: totalOrders > 0 ? '+Live' : 'No data',
      up: totalOrders > 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: 'Active Customers',
      val: String(activeCustomers),
      change: activeCustomers > 0 ? '+Live' : 'No data',
      up: activeCustomers > 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-200',
    },
    {
      label: 'Avg. Order Value',
      val: `Rs ${avgOrderValue.toFixed(0)}`,
      change: avgOrderValue > 0 ? '+Live' : 'No data',
      up: avgOrderValue > 0,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-200',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Good morning, Admin</h1>
            <p className="text-sm text-slate-500 font-body mt-0.5">Live store metrics from Firebase</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:text-blush-600 hover:border-blush-200 transition-colors">
              Home Page <ArrowUpRight size={14} />
            </Link>
            <div className="text-sm text-slate-500 font-body hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
                  <s.icon size={20} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium font-body ${s.up ? 'text-green-600' : 'text-slate-500'}`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
                </span>
              </div>
              <div className="font-display text-2xl text-slate-800 mb-0.5">{s.val}</div>
              <div className="text-xs text-slate-500 font-body">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg text-slate-800">Revenue Overview</h2>
              <span className="text-xs text-slate-500 font-body">Last 6 months</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {monthly.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-body text-slate-500">Rs {m.revenue.toFixed(0)}</span>
                  <div className="w-full rounded-t-lg bg-blush-200 hover:bg-blush-400 transition-colors" style={{ height: `${m.height}%` }} />
                  <span className="text-xs font-body text-slate-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-display text-lg text-slate-800 mb-5">Top Categories</h2>
            <div className="space-y-4">
              {categoryStats.length === 0 && <p className="text-sm text-slate-500 font-body">No category data yet.</p>}
              {categoryStats.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-body text-slate-700">{cat.name}</span>
                    <span className="text-xs font-body text-slate-500">{cat.val} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display text-lg text-slate-800">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-blush-500 hover:text-blush-600 font-body flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-2">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-display text-slate-600">{order.customer[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 font-body truncate">{order.customer}</div>
                    <div className="text-xs text-slate-400 font-body">#{order.orderCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-display text-slate-800">Rs {order.total.toFixed(0)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-body capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-slate-500 font-body p-4">No orders yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display text-lg text-slate-800">Top Products</h2>
              <Link href="/admin/products" className="text-xs text-blush-500 hover:text-blush-600 font-body flex items-center gap-1">
                Manage <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="p-2">
              {topProducts.map((p, i) => (
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
                    <div className="text-sm font-display text-slate-800">Rs {p.price}</div>
                    <div className={`text-[10px] font-body ${p.inStock ? 'text-green-600' : 'text-red-500'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && <p className="text-sm text-slate-500 font-body p-4">No products yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
