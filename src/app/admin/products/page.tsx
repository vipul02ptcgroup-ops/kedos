'use client';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Filter, ChevronDown, Star, Package } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const filtered = PRODUCTS
    .filter(p => cat === 'All' || p.category === cat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Products</h1>
            <p className="text-sm text-slate-500 font-body">{PRODUCTS.length} total products</p>
          </div>
          <button onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select value={cat} onChange={e => setCat(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-700">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-700">
                <option>All Stock</option>
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body line-clamp-1 max-w-[180px]">{p.name}</div>
                          {p.badge && <span className="text-[10px] bg-blush-100 text-blush-600 px-1.5 py-0.5 rounded-full font-body">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-body">{p.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-display text-sm text-slate-800">₹{p.price}</div>
                      {p.originalPrice && <div className="text-xs text-slate-400 line-through font-body">₹{p.originalPrice}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-body text-slate-700">{p.rating}</span>
                        <span className="text-xs text-slate-400 font-body">({p.reviews})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 font-body text-slate-700 focus:outline-none">
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/products/${p.id}`} target="_blank">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors">
                            <Eye size={15} />
                          </button>
                        </Link>
                        <button onClick={() => { setEditProduct(p); setShowModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500 font-body">Showing {filtered.length} of {PRODUCTS.length} products</p>
            <div className="flex gap-1">
              {[1, 2, 3].map(p => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-body transition-colors ${p === 1 ? 'bg-blush-500 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-xl text-slate-800">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Product Name *</label>
                <input defaultValue={editProduct?.name || ''} placeholder="e.g. Organic Cotton Onesie"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Price (₹) *</label>
                  <input type="number" defaultValue={editProduct?.price || ''} placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Original Price (₹)</label>
                  <input type="number" defaultValue={editProduct?.originalPrice || ''} placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Category</label>
                  <select defaultValue={editProduct?.category || CATEGORIES[1]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-700">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Age Range</label>
                  <input defaultValue={editProduct?.ageRange || ''} placeholder="e.g. 0–12 months"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Description</label>
                <textarea rows={3} defaultValue={editProduct?.description || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-slate-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 font-body mb-1.5">Product Image URL</label>
                <input defaultValue={editProduct?.image || ''}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800" />
              </div>
              <div className="flex gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm font-body text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked={editProduct?.inStock ?? true} className="accent-blush-500" />
                  In Stock
                </label>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-body text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-blush-500 hover:bg-blush-600 text-white rounded-xl text-sm font-body transition-colors">Save Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
