'use client';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, Star } from 'lucide-react';
import { CATEGORIES, Product } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { removeProduct, saveProduct, subscribeProducts } from '@/lib/products';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  category: CATEGORIES[1] || 'General',
  image: '',
  rating: 0,
  reviews: 0,
  description: '',
  inStock: true,
  features: [],
  ageRange: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);

  useEffect(() => {
    const unsub = subscribeProducts((rows) => {
      setProducts(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter(p => cat === 'All' || p.category === cat)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, cat, search]);

  const openForAdd = () => {
    setEditProduct(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openForEdit = (product: Product) => {
    setEditProduct(product);
    setForm({ ...product });
    setShowModal(true);
  };

  const onSave = async () => {
    await saveProduct({ ...form, id: editProduct?.id });
    setShowModal(false);
  };

  const onDelete = async (id: string) => {
    await removeProduct(id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Products</h1>
            <p className="text-sm text-slate-500 font-body">{products.length} total products</p>
          </div>
          <button onClick={openForAdd}
            className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body" />
          </div>
          <div className="relative">
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-slate-700">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!loading && filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[180px]">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{p.category}</span></td>
                    <td className="px-4 py-4">?{p.price}</td>
                    <td className="px-4 py-4">{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                    <td className="px-4 py-4"><div className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" />{p.rating}</div></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/products/${p.id}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500"><Eye size={15} /></Link>
                        <button onClick={() => openForEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500"><Edit2 size={15} /></button>
                        <button onClick={() => onDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">Showing {filtered.length} of {products.length} products</div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-xl text-slate-800">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8">X</button>
            </div>
            <div className="p-6 space-y-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                <input type="number" value={form.originalPrice || ''} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Original Price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.ageRange || ''} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} placeholder="Age Range" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />In Stock</label>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl">Cancel</button>
                <button onClick={onSave} className="px-5 py-2.5 bg-blush-500 text-white rounded-xl">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
