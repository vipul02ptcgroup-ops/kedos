'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, ChevronDown, Download } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  subscribeOrders,
  updateOrderStatus,
  type FirestoreOrder,
  type OrderStatus,
} from '@/lib/orders';

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  pending: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
};

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

type UiOrder = {
  id: string;
  orderCode: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
};

function toUiOrder(order: FirestoreOrder): UiOrder {
  const createdAt = order.createdAt?.toDate?.();
  return {
    id: order.id,
    orderCode: order.orderCode || order.id,
    customer: order.customerName || `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() || 'Customer',
    email: order.email || order.delivery?.email || '-',
    date: createdAt ? createdAt.toLocaleDateString('en-IN') : 'N/A',
    items: Number(order.itemsCount || order.items?.length || 0),
    total: Number(order.total || 0),
    status: (String(order.status || 'pending').toLowerCase() as OrderStatus),
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<UiOrder | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeOrders((rows) => setOrders(rows.map(toUiOrder)));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter((o) => {
        if (!q) return true;
        return (
          o.customer.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.orderCode.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
        );
      });
  }, [orders, search, statusFilter]);

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => filtered.some((o) => o.id === id)));
  }, [filtered]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    const prev = orders;
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch {
      setOrders(prev);
    }
  };

  const handleSaveDetailStatus = async () => {
    if (!detailOrder) return;
    setStatusSaving(true);
    try {
      await updateOrderStatus(detailOrder.id, detailOrder.status);
      setDetailOrder(null);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Orders</h1>
            <p className="text-sm text-slate-500 font-body">{orders.length} total orders</p>
          </div>
          <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm font-body hover:bg-slate-50 transition-colors">
            <Download size={15} /> Export
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          {(['all', ...ORDER_STATUSES] as const).map((s) => {
            const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`p-3 rounded-xl text-left transition-colors border ${statusFilter === s ? 'border-blush-400 bg-blush-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
              >
                <div className="font-display text-xl text-slate-800">{count}</div>
                <div className={`text-xs font-body mt-0.5 capitalize ${statusFilter === s ? 'text-blush-600 font-medium' : 'text-slate-500'}`}>{s}</div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or order ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800"
            />
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-slate-700 focus:outline-none">
              <option>All Dates</option>
              <option>Today</option>
              <option>Last 7 days</option>
              <option>This month</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      className="accent-blush-500 rounded"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((o) => o.id))}
                    />
                  </th>
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((order) => (
                  <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(order.id) ? 'bg-blush-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" className="accent-blush-500" checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-blush-600 font-body">#{order.orderCode}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-display text-slate-600">{order.customer[0] || 'C'}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{order.customer}</div>
                          <div className="text-xs text-slate-400 font-body">{order.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{order.date}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{order.items}</td>
                    <td className="px-4 py-4 font-display text-sm text-slate-800">₹{order.total.toFixed(0)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs px-2.5 py-1 rounded-full font-body border-0 cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500 font-body">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-body">
              {filtered.length} orders · Total: <strong>₹{totalRevenue.toFixed(0)}</strong>
            </p>
            <div className="flex gap-1">
              {[1, 2].map((p) => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-body ${p === 1 ? 'bg-blush-500 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {detailOrder && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setDetailOrder(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-xl text-slate-800">Order #{detailOrder.orderCode}</h2>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                {[
                  ['Customer', detailOrder.customer],
                  ['Email', detailOrder.email],
                  ['Date', detailOrder.date],
                  ['Items', `${detailOrder.items} items`],
                  ['Total', `₹${detailOrder.total.toFixed(0)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm font-body">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 font-body mb-2">Update Status</label>
                <select
                  value={detailOrder.status}
                  onChange={(e) => setDetailOrder((prev) => (prev ? { ...prev, status: e.target.value as OrderStatus } : prev))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 capitalize text-slate-700"
                >
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 font-body mb-2">Note</label>
                <textarea rows={3} placeholder="Add internal note..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none resize-none text-slate-800" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDetailOrder(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-body text-slate-600">Close</button>
                <button
                  onClick={handleSaveDetailStatus}
                  disabled={statusSaving}
                  className="flex-1 py-2.5 bg-blush-500 text-white rounded-xl text-sm font-body hover:bg-blush-600 disabled:bg-blush-300 transition-colors"
                >
                  {statusSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
