'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { deleteReview, subscribeAllReviews, type ProductReview } from '@/lib/reviews';
import { subscribeProducts } from '@/lib/products';
import type { Product } from '@/lib/data';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeAllReviews(setRows);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.content, r.userEmail, r.productId].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  const onDelete = async (row: ProductReview) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(row.id, row.productId);
    await createAdminLog({
      action: 'review_deleted',
      ...getAdminActorSnapshot(),
      targetUid: row.id,
      targetEmail: row.userEmail || '',
      details: `product=${row.productId}, rating=${row.rating}`,
    });
  };

  const productNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) map[p.id] = p.name;
    return map;
  }, [products]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Reviews</h1>
          <p className="text-sm text-slate-500 font-body">{rows.length} total reviews</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Name', 'Product', 'Rating', 'Type', 'Review', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4 text-sm text-slate-800">{row.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{productNameById[row.productId] || row.productId}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{row.rating}/5</td>
                    <td className="px-4 py-4 text-sm">
                      {row.isGenuine ? (
                        <span className="px-2 py-1 rounded-full bg-sage-100 text-sage-700 text-xs font-medium">Genuine</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Fake</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-md truncate">{row.content}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{row.createdAt?.toDate?.().toLocaleDateString('en-IN') || '-'}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => onDelete(row)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No reviews found.</td>
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
