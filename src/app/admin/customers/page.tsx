'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Users, ShieldCheck, UserRound, Phone, CalendarDays, Fingerprint, Settings } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole, getUserRole, subscribeAuth } from '@/lib/auth';
import { createAdminLog } from '@/lib/adminLogs';

type AdminUserRow = {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  adminControls?: string[];
  createdAt?: any;
};

const AVAILABLE_CONTROLS = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'size_guide', label: 'Size Guide' },
  { key: 'orders', label: 'Orders' },
  { key: 'coupons', label: 'Coupons' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'messages', label: 'Messages' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'cart_interest', label: 'Cart Interest' },
  { key: 'customers', label: 'Customers' },
  { key: 'settings', label: 'Settings' },
];

function formatJoined(createdAt: any): string {
  const date = createdAt?.toDate?.();
  if (!date) return '-';
  return date.toLocaleDateString('en-IN');
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [controlsForm, setControlsForm] = useState<string[]>([]);
  const [savingControls, setSavingControls] = useState(false);
  const [viewerRole, setViewerRole] = useState<UserRole>('customer');
  const [viewerUid, setViewerUid] = useState('');
  const [viewerEmail, setViewerEmail] = useState('');
  const [viewerName, setViewerName] = useState('');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snap) => {
      const rows: AdminUserRow[] = snap.docs.map((d) => {
        const data: any = d.data() || {};
        const roleValue = String(data?.role || '').toLowerCase();
        const role: UserRole =
          roleValue === 'superadmin' ? 'superadmin' : roleValue === 'admin' ? 'admin' : 'customer';
        return {
          id: d.id,
          uid: String(data?.uid || d.id),
          name: String(data?.name || '').trim(),
          email: String(data?.email || '').trim(),
          phone: String(data?.phone || '').trim(),
          role,
          adminControls: Array.isArray(data?.adminControls) ? data.adminControls.map((x: any) => String(x)) : [],
          createdAt: data?.createdAt,
        };
      });
      setUsers(rows);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        setViewerRole('customer');
        setViewerUid('');
        setViewerEmail('');
        setViewerName('');
        return;
      }
      const role = await getUserRole(user.uid);
      setViewerRole(role);
      setViewerUid(user.uid || '');
      setViewerEmail(user.email || '');
      setViewerName(user.displayName || '');
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((u) => roleFilter === 'all' || u.role === roleFilter)
      .filter((u) => {
        if (!term) return true;
        return (
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.phone.toLowerCase().includes(term) ||
          u.uid.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const ad = a.createdAt?.seconds || 0;
        const bd = b.createdAt?.seconds || 0;
        return bd - ad;
      });
  }, [users, roleFilter, search]);

  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;

  const updateUserRole = async (userId: string, role: UserRole) => {
    const target = users.find((u) => u.id === userId);
    const fromRole = target?.role || 'customer';
    await updateDoc(doc(db, 'users', userId), { role });
    await createAdminLog({
      action: 'role_changed',
      actorUid: viewerUid,
      actorEmail: viewerEmail,
      actorName: viewerName,
      targetUid: target?.uid || userId,
      targetEmail: target?.email || '',
      details: `Role updated from ${fromRole} to ${role}.`,
    });
  };

  const openControls = (u: AdminUserRow) => {
    setSelectedUser(u);
    setControlsForm(Array.isArray(u.adminControls) ? u.adminControls : []);
  };

  const saveControls = async () => {
    if (!selectedUser) return;
    setSavingControls(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), { adminControls: controlsForm });
      await createAdminLog({
        action: 'admin_controls_updated',
        actorUid: viewerUid,
        actorEmail: viewerEmail,
        actorName: viewerName,
        targetUid: selectedUser.uid,
        targetEmail: selectedUser.email,
        details: `Controls set to: ${controlsForm.length ? controlsForm.join(', ') : 'none'}.`,
      });
      setSelectedUser(null);
      setControlsForm([]);
    } finally {
      setSavingControls(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Customers</h1>
            <p className="text-sm text-slate-500 font-body">{users.length} total users (admin + customer)</p>
          </div>
          <button className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
            <Mail size={15} /> Email All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="font-display text-xl text-slate-800">{users.length}</div>
              <div className="text-xs text-slate-500 font-body">Total Users</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-display text-xl text-slate-800">{totalAdmins}</div>
              <div className="text-xs text-slate-500 font-body">Admins</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <UserRound size={18} />
            </div>
            <div>
              <div className="font-display text-xl text-slate-800">{totalCustomers}</div>
              <div className="text-xs text-slate-500 font-body">Customers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, phone or UID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-slate-800"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'superadmin', 'admin', 'customer'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-body capitalize transition-colors ${
                  roleFilter === f ? 'bg-blush-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Role', 'Phone', 'Joined', 'UID', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 font-body uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1.5">
                        {h === 'Role' && <ShieldCheck size={13} />}
                        {h === 'Phone' && <Phone size={13} />}
                        {h === 'Joined' && <CalendarDays size={13} />}
                        {h === 'UID' && <Fingerprint size={13} />}
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blush-100 rounded-full flex items-center justify-center">
                          <span className="font-display text-sm text-blush-700">{(u.name || u.email || 'U').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 font-body">{u.name || '-'}</div>
                          <div className="text-xs text-slate-400 font-body">{u.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-body font-medium capitalize ${
                          u.role === 'superadmin'
                            ? 'bg-rose-100 text-rose-700'
                            : u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {u.role === 'customer' ? <UserRound size={12} /> : <ShieldCheck size={12} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{u.phone || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 font-body">{formatJoined(u.createdAt)}</td>
                    <td className="px-4 py-4 text-xs text-slate-500 font-mono">{u.uid}</td>
                    <td className="px-4 py-4">
                      {viewerRole === 'superadmin' ? (
                        <div className="flex gap-2">
                          {u.role === 'customer' ? (
                            <button onClick={() => updateUserRole(u.id, 'admin')} className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium">
                              Make Admin
                            </button>
                          ) : (
                            <>
                              {u.role !== 'superadmin' && (
                                <button onClick={() => updateUserRole(u.id, 'customer')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                                  Make Customer
                                </button>
                              )}
                              {u.role === 'admin' && (
                                <button onClick={() => openControls(u)} className="px-3 py-1.5 rounded-lg bg-blush-100 text-blush-700 text-xs font-medium inline-flex items-center gap-1">
                                  <Settings size={12} /> Controls
                                </button>
                              )}
                              {u.role === 'superadmin' && (
                                <span className="text-xs text-slate-400 font-body">Set via Firebase only</span>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-body">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500 font-body">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl text-slate-800 mb-1">Admin Controls</h3>
            <p className="text-sm text-slate-500 mb-4">{selectedUser.name || selectedUser.email}</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-5">
              {AVAILABLE_CONTROLS.map((c) => {
                const checked = controlsForm.includes(c.key);
                return (
                  <label key={c.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setControlsForm((prev) =>
                          e.target.checked ? [...prev, c.key] : prev.filter((x) => x !== c.key)
                        )
                      }
                      className="accent-blush-500"
                    />
                    {c.label}
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedUser(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm">Cancel</button>
              <button onClick={saveControls} disabled={savingControls} className="flex-1 py-2.5 rounded-xl bg-blush-500 text-white text-sm disabled:bg-blush-300">
                {savingControls ? 'Saving...' : 'Save Controls'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
