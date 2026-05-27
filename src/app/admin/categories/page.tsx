'use client';
import { useEffect, useMemo, useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CategoryDoc, createCategory, removeCategoryByName, renameCategory, subscribeCategoryDocs } from '@/lib/categories';
import { Product } from '@/lib/data';
import { subscribeProducts } from '@/lib/products';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newIconName, setNewIconName] = useState('Tag');
  const [editFrom, setEditFrom] = useState('');
  const [editTo, setEditTo] = useState('');
  const [editIconName, setEditIconName] = useState('Tag');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = subscribeCategoryDocs(setCategories);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  const counts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const onAdd = async () => {
    setError('');
    await createCategory(newCategory, newIconName);
    await createAdminLog({
      action: 'category_created',
      ...getAdminActorSnapshot(),
      details: `${newCategory} (${newIconName})`,
    });
    setNewCategory('');
    setNewIconName('Tag');
  };

  const onDelete = async (name: string) => {
    setError('');
    if ((counts[name] || 0) > 0) {
      setError(`Cannot delete "${name}" because ${counts[name]} product(s) are using it.`);
      return;
    }
    await removeCategoryByName(name);
    await createAdminLog({
      action: 'category_deleted',
      ...getAdminActorSnapshot(),
      details: name,
    });
  };

  const onStartEdit = (name: string) => {
    setError('');
    setEditFrom(name);
    setEditTo(name);
    const row = categories.find((c) => c.name === name);
    setEditIconName(row?.iconName || 'Tag');
  };

  const onSaveEdit = async () => {
    if (!editFrom) return;
    setError('');
    try {
      await renameCategory(editFrom, editTo, editIconName);
      await createAdminLog({
        action: 'category_updated',
        ...getAdminActorSnapshot(),
        details: `${editFrom} -> ${editTo} (${editIconName})`,
      });
      setEditFrom('');
      setEditTo('');
      setEditIconName('Tag');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rename category');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Categories</h1>
          <p className="text-sm text-slate-500 font-body">{categories.length} total categories</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body"
            />
            <input
              value={newIconName}
              onChange={(e) => setNewIconName(e.target.value)}
              placeholder="Icon name (e.g. Shirt)"
              className="sm:w-56 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body"
            />
            <button onClick={onAdd} className="px-4 py-2.5 bg-cocoa-800 text-white rounded-xl text-sm font-body inline-flex items-center gap-2">
              <Plus size={14} /> Add Category
            </button>
          </div>
          {error && <p className="text-sm text-red-500 font-body mb-3">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs uppercase text-slate-500 font-body">Category</th>
                  <th className="text-left py-2 text-xs uppercase text-slate-500 font-body">Icon</th>
                  <th className="text-left py-2 text-xs uppercase text-slate-500 font-body">Products</th>
                  <th className="text-left py-2 text-xs uppercase text-slate-500 font-body">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50">
                    <td className="py-3 text-sm text-slate-800 font-body">
                      {editFrom === row.name ? (
                        <input
                          value={editTo}
                          onChange={(e) => setEditTo(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      ) : (
                        row.name
                      )}
                    </td>
                    <td className="py-3 text-sm text-slate-600 font-body">
                      {editFrom === row.name ? (
                        <input
                          value={editIconName}
                          onChange={(e) => setEditIconName(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        />
                      ) : (
                        row.iconName || 'Tag'
                      )}
                    </td>
                    <td className="py-3 text-sm text-slate-600 font-body">{counts[row.name] || 0}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {editFrom === row.name ? (
                          <>
                            <button onClick={onSaveEdit} className="px-3 py-1.5 rounded-lg bg-blush-500 text-white text-xs">Save</button>
                            <button onClick={() => { setEditFrom(''); setEditTo(''); setEditIconName('Tag'); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onStartEdit(row.name)} className="w-8 h-8 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 flex items-center justify-center">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => onDelete(row.name)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {categories.length === 0 && <p className="text-sm text-slate-500 font-body mt-2">No categories yet.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
