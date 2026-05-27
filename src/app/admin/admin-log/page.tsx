'use client';
import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Activity, Clock3, UserRound } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUserRole, subscribeAuth, type UserRole } from '@/lib/auth';
import { subscribeAdminLogs, type AdminLogEntry } from '@/lib/adminLogs';

function formatDateTime(createdAt: any): string {
  const dt = createdAt?.toDate?.();
  if (!dt) return '-';
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminLogPage() {
  const [viewerRole, setViewerRole] = useState<UserRole>('customer');
  const [authChecked, setAuthChecked] = useState(false);
  const [rows, setRows] = useState<AdminLogEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        setViewerRole('customer');
        setAuthChecked(true);
        return;
      }
      const role = await getUserRole(user.uid);
      setViewerRole(role);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authChecked || viewerRole !== 'superadmin') return;
    const unsub = subscribeAdminLogs(setRows, 500);
    return () => unsub();
  }, [authChecked, viewerRole]);

  const totalActions = rows.length;
  const uniqueActors = useMemo(
    () => new Set(rows.map((r) => r.actorUid || r.actorEmail).filter(Boolean)).size,
    [rows]
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800">Admin Log</h1>
          <p className="text-sm text-slate-500 font-body">Track admin-level activity across the panel.</p>
        </div>

        {!authChecked ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 font-body">Checking access...</div>
        ) : viewerRole !== 'superadmin' ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <div className="flex items-center gap-2 text-rose-700 mb-2">
              <ShieldAlert size={18} />
              <p className="font-medium font-body">Access restricted</p>
            </div>
            <p className="text-sm text-rose-700/80 font-body">Only superadmin can view admin logs.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Activity size={16} />
                  <p className="text-xs uppercase tracking-wide font-body">Total Actions</p>
                </div>
                <p className="font-display text-2xl text-slate-800">{totalActions}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <UserRound size={16} />
                  <p className="text-xs uppercase tracking-wide font-body">Unique Admins</p>
                </div>
                <p className="font-display text-2xl text-slate-800">{uniqueActors}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Time', 'Action', 'Actor', 'Target', 'Details'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 font-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-600 font-body whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} />
                            {formatDateTime(row.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium font-body">{row.action || '-'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-body">{row.actorEmail || row.actorUid || '-'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-body">{row.targetEmail || row.targetUid || '-'}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-body">{row.details || '-'}</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 font-body">
                          No admin activity logged yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
