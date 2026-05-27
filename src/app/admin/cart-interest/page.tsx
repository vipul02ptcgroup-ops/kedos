'use client';
import { useEffect, useMemo, useState } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/lib/data';
import { subscribeProducts } from '@/lib/products';
import {
  CartInterestAdminSummary,
  subscribeCartInterestItems,
  summarizeCartInterest,
} from '@/lib/cartInterest';

export default function AdminCartInterestPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<CartInterestAdminSummary[]>([]);
  const [selected, setSelected] = useState<(CartInterestAdminSummary & { product: Product | null }) | null>(null);

  useEffect(() => {
    const unsubProducts = subscribeProducts(setProducts);
    const unsubCart = subscribeCartInterestItems((items) => setSummary(summarizeCartInterest(items)));
    return () => {
      unsubProducts();
      unsubCart();
    };
  }, []);

  const rows = useMemo(() => {
    return summary.map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.productId) || null,
    }));
  }, [summary, products]);

  const totalAdds = summary.reduce((sum, s) => sum + s.totalAdds, 0);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Cart Interest</h1>
          <p className="text-sm text-slate-500 font-body">{totalAdds} total cart adds</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Cart Adds', 'Users', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => (
                  <tr key={row.productId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {row.product ? (
                          <img src={row.product.image} alt={row.product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{row.product?.name || row.productId}</div>
                          <div className="text-xs text-slate-400 font-body">{row.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{row.product?.category || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 font-body">
                        <ShoppingBag size={14} />
                        {row.totalAdds}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{row.users.length}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelected(row)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 font-body">No cart interest data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-xl text-slate-800">Users Who Added to Cart</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">X</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 font-body mb-4">
                Product: <span className="font-medium">{selected.product?.name || selected.productId}</span>
              </p>
              <div className="space-y-3">
                {selected.users.map((u) => (
                  <div key={u.userId} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm text-slate-800 font-body font-medium">{u.name || 'User'}</p>
                    <p className="text-xs text-slate-500 font-body">{u.email || 'No email'}</p>
                    <p className="text-[11px] text-slate-400 font-body mt-1">{u.userId}</p>
                    <p className="text-[11px] text-blue-600 font-body mt-1">Added {u.addCount} times</p>
                  </div>
                ))}
                {selected.users.length === 0 && (
                  <p className="text-sm text-slate-500 font-body">No users found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
