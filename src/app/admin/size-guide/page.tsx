'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DEFAULT_SIZE_GUIDE, saveSizeGuide, subscribeSizeGuide, type SizeGuideContent } from '@/lib/sizeGuide';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

export default function AdminSizeGuidePage() {
  const [form, setForm] = useState<SizeGuideContent>(DEFAULT_SIZE_GUIDE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsub = subscribeSizeGuide(setForm);
    return () => unsub();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveSizeGuide({
        clothingRows: form.clothingRows.filter((r) => r.age || r.chest || r.length),
        shoeRows: form.shoeRows.filter((r) => r.age || r.foot),
        tips: form.tips.map((t) => t.trim()).filter(Boolean),
        customSections: (form.customSections || [])
          .map((s) => ({
            title: s.title.trim(),
            rows: (s.rows || []).filter((r) => r.label || r.value),
          }))
          .filter((s) => s.title || s.rows.length > 0),
      });
      await createAdminLog({
        action: 'size_guide_saved',
        ...getAdminActorSnapshot(),
        details: `customSections=${form.customSections?.length || 0}, clothingRows=${form.clothingRows.length}, shoeRows=${form.shoeRows.length}`,
      });
      setMessage('Size guide updated.');
    } catch (err: any) {
      setMessage(err?.message || 'Unable to save size guide.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-slate-800">Size Guide</h1>
          <p className="text-sm text-slate-500 font-body">Manage size guide content shown on public page.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-slate-800">Custom Size Sections</h2>
            <button
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  customSections: [...(prev.customSections || []), { title: '', rows: [{ label: '', value: '' }] }],
                }))
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
            >
              <Plus size={14} /> Add Section
            </button>
          </div>

          <div className="space-y-5">
            {(form.customSections || []).map((section, sectionIdx) => (
              <div key={sectionIdx} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={section.title}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        customSections: (p.customSections || []).map((s, i) =>
                          i === sectionIdx ? { ...s, title: e.target.value } : s
                        ),
                      }))
                    }
                    placeholder="Section title (e.g. Accessories Size Guide)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                  <button
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        customSections: (p.customSections || []).filter((_, i) => i !== sectionIdx),
                      }))
                    }
                    className="w-10 h-10 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  {section.rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-12 gap-2">
                      <input
                        value={row.label}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            customSections: (p.customSections || []).map((s, i) =>
                              i === sectionIdx
                                ? {
                                    ...s,
                                    rows: s.rows.map((r, j) =>
                                      j === rowIdx ? { ...r, label: e.target.value } : r
                                    ),
                                  }
                                : s
                            ),
                          }))
                        }
                        placeholder="Label (e.g. Age / Size)"
                        className="col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                      <input
                        value={row.value}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            customSections: (p.customSections || []).map((s, i) =>
                              i === sectionIdx
                                ? {
                                    ...s,
                                    rows: s.rows.map((r, j) =>
                                      j === rowIdx ? { ...r, value: e.target.value } : r
                                    ),
                                  }
                                : s
                            ),
                          }))
                        }
                        placeholder="Value (e.g. 20-22 in)"
                        className="col-span-6 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                      <button
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            customSections: (p.customSections || []).map((s, i) =>
                              i === sectionIdx
                                ? { ...s, rows: s.rows.filter((_, j) => j !== rowIdx) }
                                : s
                            ),
                          }))
                        }
                        className="col-span-1 h-10 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      customSections: (p.customSections || []).map((s, i) =>
                        i === sectionIdx ? { ...s, rows: [...s.rows, { label: '', value: '' }] } : s
                      ),
                    }))
                  }
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-slate-800">Clothing Size Chart</h2>
            <button
              onClick={() => setForm((prev) => ({ ...prev, clothingRows: [...prev.clothingRows, { age: '', chest: '', length: '' }] }))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            {form.clothingRows.map((r, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input value={r.age} onChange={(e) => setForm((p) => ({ ...p, clothingRows: p.clothingRows.map((x, i) => i === idx ? { ...x, age: e.target.value } : x) }))} placeholder="Age" className="col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input value={r.chest} onChange={(e) => setForm((p) => ({ ...p, clothingRows: p.clothingRows.map((x, i) => i === idx ? { ...x, chest: e.target.value } : x) }))} placeholder="Chest" className="col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input value={r.length} onChange={(e) => setForm((p) => ({ ...p, clothingRows: p.clothingRows.map((x, i) => i === idx ? { ...x, length: e.target.value } : x) }))} placeholder="Length" className="col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <button onClick={() => setForm((p) => ({ ...p, clothingRows: p.clothingRows.filter((_, i) => i !== idx) }))} className="col-span-1 h-10 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-slate-800">Footwear Guide</h2>
            <button
              onClick={() => setForm((prev) => ({ ...prev, shoeRows: [...prev.shoeRows, { age: '', foot: '' }] }))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            {form.shoeRows.map((r, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input value={r.age} onChange={(e) => setForm((p) => ({ ...p, shoeRows: p.shoeRows.map((x, i) => i === idx ? { ...x, age: e.target.value } : x) }))} placeholder="Age" className="col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input value={r.foot} onChange={(e) => setForm((p) => ({ ...p, shoeRows: p.shoeRows.map((x, i) => i === idx ? { ...x, foot: e.target.value } : x) }))} placeholder="Foot Length" className="col-span-6 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <button onClick={() => setForm((p) => ({ ...p, shoeRows: p.shoeRows.filter((_, i) => i !== idx) }))} className="col-span-1 h-10 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-slate-800">Measuring Tips</h2>
            <button
              onClick={() => setForm((prev) => ({ ...prev, tips: [...prev.tips, ''] }))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
            >
              <Plus size={14} /> Add Tip
            </button>
          </div>
          <div className="space-y-2">
            {form.tips.map((tip, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input value={tip} onChange={(e) => setForm((p) => ({ ...p, tips: p.tips.map((x, i) => i === idx ? e.target.value : x) }))} placeholder="Tip text" className="col-span-11 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <button onClick={() => setForm((p) => ({ ...p, tips: p.tips.filter((_, i) => i !== idx) }))} className="col-span-1 h-10 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-xl bg-blush-500 text-white text-sm font-medium disabled:bg-blush-300">
            {saving ? 'Saving...' : 'Save Size Guide'}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
