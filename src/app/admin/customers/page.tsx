'use client';
import { useState } from 'react';
import { Search, Mail, Eye, UserCheck, UserX, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { CUSTOMERS } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = CUSTOMERS
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = CUSTOMERS.reduce((s, c) => s + c.spent, 0);
  const avgOrderValue = CUSTOMERS.reduce((s, c) => s + c.spent, 0) / CUSTOMERS.reduce((s, c) => s + c.orders, 0);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Customers</h1>
            <p className="text-sm text-slate-500 font-body">{CUSTOMERS.length} registered customers</p>
          </div>
          <button className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
            <Mail size={15} /> Email All
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { icon: Users, label: 'Total Customers', val: CUSTOMERS.length, color: 'bg-blue-50 text-blue-600' },
            { icon: UserCheck, label: 'Active', val: CUSTOMERS.filter(c => c.status === 'active').length, color: 'bg-green-50 text-green-600' },
            { icon: DollarSign, label: 'Total Revenue', val: `₹${totalRevenue.toFixed(0)}`, color: 'bg-blush-50 text-blush-600' },
            { icon: ShoppingBag, label: 'Avg. Order Value', val: `₹${avgOrderValue.toFixed(0)}`, color: 'bg-amber-50 text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon size={18} />
              </div>
              <div>
                <div className="font-display text-xl text-slate-800">{s.val}</div>
                <div className="text-xs text-slate-500 font-body">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-body capitalize transition-colors ${
                  filter === f ? 'bg-blush-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Customer', 'Joined', 'Orders', 'Total Spent', 'Avg. Order', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blush-100 rounded-full flex items-center justify-center">
                          <span className="font-display text-sm text-blush-700">{c.name[0]}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{c.name}</div>
                          <div className="text-xs text-slate-400 font-body">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{c.joined}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-800 font-body">{c.orders}</td>
                    <td className="px-4 py-4 font-display text-sm text-slate-800">₹{c.spent.toFixed(0)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">₹{(c.spent / c.orders).toFixed(0)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium capitalize ${
                        c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-500 transition-colors">
                          <Mail size={15} />
                        </button>
                        {c.status === 'active'
                          ? <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><UserX size={15} /></button>
                          : <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-500 transition-colors"><UserCheck size={15} /></button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
