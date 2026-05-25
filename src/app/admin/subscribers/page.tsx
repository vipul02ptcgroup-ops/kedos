'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { deleteSubscriber, subscribeSubscribers, type Subscriber } from '@/lib/subscribers';

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeSubscribers(setRows);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.emailLower.includes(q));
  }, [rows, search]);

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this subscriber?')) return;
    await deleteSubscriber(id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Subscribers</h1>
            <p className="text-sm text-slate-500 font-body">{rows.length} total subscribers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Email', 'Subscribed On', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4 text-sm text-slate-800">{row.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{row.createdAt?.toDate?.().toLocaleString('en-IN') || '-'}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onDelete(row.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">No subscribers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

