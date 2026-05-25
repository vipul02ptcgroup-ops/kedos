'use client';
import { useEffect, useMemo, useState } from 'react';
import { Eye, Search, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  deleteContactMessage,
  replyToContactMessage,
  subscribeContactMessages,
  type ContactMessage,
  type ContactMessageStatus,
} from '@/lib/messages';

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<ContactMessageStatus>('in_progress');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeContactMessages(setRows);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.subject, r.message, r.status, r.adminReply].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  const onOpen = (row: ContactMessage) => {
    setDetail(row);
    setReply(row.adminReply || '');
    setStatus((row.status || 'in_progress') as ContactMessageStatus);
  };

  const onSaveReply = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await replyToContactMessage(detail.id, { reply, status });
      setDetail(null);
      setReply('');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    await deleteContactMessage(id);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500 font-body">{rows.length} total messages</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Name', 'Email', 'Subject', 'Message', 'Status', 'Reply', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4 text-sm text-slate-800">{row.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.subject || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-sm truncate">{row.message}</td>
                    <td className="px-4 py-4 text-sm capitalize">{row.status}</td>
                    <td className="px-4 py-4 text-sm">
                      {row.hasReply ? (
                        <span className="px-2 py-1 rounded-full bg-sage-100 text-sage-700 text-xs font-medium">Replied</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{row.createdAt?.toDate?.().toLocaleString('en-IN') || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpen(row)}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                          title="View/Reply"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(row.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">No messages found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setDetail(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-xl text-slate-800">Message Details</h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <p><strong>Name:</strong> {detail.name}</p>
                <p><strong>Email:</strong> {detail.email}</p>
                <p><strong>Subject:</strong> {detail.subject || '-'}</p>
                <p><strong>Message:</strong> {detail.message}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ContactMessageStatus)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
                  <option value="new">new</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reply to User</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={5}
                  placeholder="Type reply for this user..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
                />
              </div>
              <button
                onClick={onSaveReply}
                disabled={saving || !reply.trim()}
                className="w-full py-2.5 bg-blush-500 text-white rounded-xl text-sm disabled:bg-blush-300"
              >
                {saving ? 'Saving Reply...' : 'Save Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

