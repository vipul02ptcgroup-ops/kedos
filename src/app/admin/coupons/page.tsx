'use client';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Tag, Power } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Product } from '@/lib/data';
import { subscribeProducts } from '@/lib/products';
import {
  createCoupon,
  subscribeCoupons,
  updateCoupon,
  type CouponDiscountType,
  type CouponDoc,
} from '@/lib/coupons';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

export default function AdminCouponsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<CouponDoc[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percent' as CouponDiscountType,
    discountValue: 10,
    productIds: [] as string[],
    active: true,
  });

  useEffect(() => {
    const unsubProducts = subscribeProducts(setProducts);
    const unsubCoupons = subscribeCoupons(setCoupons);
    return () => {
      unsubProducts();
      unsubCoupons();
    };
  }, []);

  const productNameById = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [products]);

  const onCreate = async () => {
    setSaving(true);
    setError('');
    try {
      await createCoupon(form);
      await createAdminLog({
        action: 'coupon_created',
        ...getAdminActorSnapshot(),
        details: `${form.code.toUpperCase()} (${form.discountType}:${form.discountValue})`,
      });
      setShowModal(false);
      setForm({
        code: '',
        title: '',
        description: '',
        discountType: 'percent',
        discountValue: 10,
        productIds: [],
        active: true,
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const toggleActive = async (row: CouponDoc) => {
    await updateCoupon(row.id, { active: !row.active });
    await createAdminLog({
      action: 'coupon_status_changed',
      ...getAdminActorSnapshot(),
      targetUid: row.id,
      details: `${row.codeUpper} -> ${!row.active ? 'active' : 'inactive'}`,
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Coupons</h1>
            <p className="text-sm text-slate-500 font-body">{coupons.length} total coupons</p>
          </div>
          <button
            onClick={() => {
              setError('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors"
          >
            <Plus size={15} /> Create Coupon
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Code', 'Title', 'Discount', 'Products', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-semibold text-blush-600">{c.codeUpper}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{c.title || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{c.productIds.length}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleActive(c)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs hover:bg-slate-50">
                        <Power size={12} /> {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 font-body">No coupons created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display text-xl text-slate-800">Create Coupon</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Coupon Code (e.g. BABY10)" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Description (optional)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none" />
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as CouponDiscountType }))} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
                <input type="number" min={1} value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value || 0) }))} placeholder="Discount value" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-700 mb-2 inline-flex items-center gap-1.5"><Tag size={14} /> Select Products</p>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-blush-500" />
                      <span className="text-slate-700">{productNameById[p.id] || p.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="accent-blush-500" />
                Set coupon as Active
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm">Cancel</button>
              <button onClick={onCreate} disabled={saving} className="px-5 py-2.5 rounded-xl bg-blush-500 text-white text-sm disabled:bg-blush-300">
                {saving ? 'Saving...' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
