'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Star,
  Menu, X, Bell, ChevronDown, TrendingUp, LogOut, BarChart2, Tags, Heart, MessageSquare, Mail, MessageCircleMore, Ruler, ShoppingBag, TicketPercent, ClipboardList
} from 'lucide-react';
import { getUserRole, logoutUser, subscribeAuth } from '@/lib/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tags },
      { label: 'Size Guide', href: '/admin/size-guide', icon: Ruler },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
      { label: 'Reviews', href: '/admin/reviews', icon: MessageCircleMore },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { label: 'Wishlist', href: '/admin/wishlist', icon: Heart },
      { label: 'Cart Interest', href: '/admin/cart-interest', icon: ShoppingBag },
    ],
  },
  {
    title: 'Users',
    items: [{ label: 'Customers', href: '/admin/customers', icon: Users }],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Admin Log', href: '/admin/admin-log', icon: ClipboardList },
    ],
  },
];

const NAV = NAV_SECTIONS.flatMap((section) => section.items);

const CONTROL_BY_HREF: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/products': 'products',
  '/admin/categories': 'categories',
  '/admin/size-guide': 'size_guide',
  '/admin/orders': 'orders',
  '/admin/coupons': 'coupons',
  '/admin/reviews': 'reviews',
  '/admin/analytics': 'analytics',
  '/admin/subscribers': 'subscribers',
  '/admin/messages': 'messages',
  '/admin/wishlist': 'wishlist',
  '/admin/cart-interest': 'cart_interest',
  '/admin/customers': 'customers',
  '/admin/settings': 'settings',
  '/admin/admin-log': 'admin_log',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [allowedControls, setAllowedControls] = useState<string[] | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'superadmin' | 'customer'>('customer');
  const [uid, setUid] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      const role = await getUserRole(user.uid);
      if (role !== 'admin' && role !== 'superadmin') {
        router.replace('/');
        return;
      }
      setUserRole(role);
      setUid(user.uid);

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const controls = userSnap.exists() ? (userSnap.data() as any)?.adminControls : null;
      setAllowedControls(Array.isArray(controls) ? controls.map((c: any) => String(c)) : null);
      setAdminEmail(user.email || '');
      setAuthChecked(true);
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!db || !uid || userRole !== 'admin') return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const controls = snap.exists() ? (snap.data() as any)?.adminControls : null;
      setAllowedControls(Array.isArray(controls) ? controls.map((c: any) => String(c)) : []);
    });
    return () => unsub();
  }, [uid, userRole]);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const canAccess = (href: string) => {
    if (href === '/admin/admin-log') return userRole === 'superadmin';
    if (userRole === 'superadmin') return true;
    if (userRole === 'admin') {
      if (href === '/admin/customers') return true;
      const control = CONTROL_BY_HREF[href];
      if (!control) return false;
      return Array.isArray(allowedControls) && allowedControls.includes(control);
    }
    if (href === '/admin') return true;
    if (!allowedControls || allowedControls.length === 0) return true; // legacy admins: full access
    const control = CONTROL_BY_HREF[href];
    if (!control) return true;
    return allowedControls.includes(control);
  };

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccess(item.href)),
  })).filter((section) => section.items.length > 0);

  useEffect(() => {
    if (!authChecked) return;
    const matched = NAV.find((n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)));
    if (matched && !canAccess(matched.href)) {
      router.replace('/admin/customers');
    }
  }, [pathname, authChecked, router, allowedControls, userRole]);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="animate-spin h-8 w-8 text-blush-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm font-body">Verifying admin access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-body overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-cocoa-900 flex flex-col transition-all duration-300 shrink-0`}
        style={{ backgroundColor: '#1a0f08' }}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-blush-500 rounded-lg flex items-center justify-center shrink-0">
            <Star size={16} className="text-white fill-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-display text-sm text-cream-100 truncate">Kedos</div>
              <div className="text-[10px] text-cream-200/40 font-body">Admin Panel</div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-3">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {sidebarOpen && (
                  <p className="px-3 pb-1 text-[10px] uppercase tracking-wider text-cream-200/30 font-semibold">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                          active ? 'bg-blush-500 text-white' : 'text-cream-200/50 hover:bg-white/10 hover:text-cream-100'
                        }`}>
                        <item.icon size={18} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            onClick={handleLogout}>
            <div className="w-8 h-8 bg-blush-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-display">A</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-cream-100 truncate">Admin User</div>
                <div className="text-[10px] text-cream-200/40 truncate">{adminEmail}</div>
              </div>
            )}
            {sidebarOpen && <LogOut size={14} className="text-cream-200/40 shrink-0" />}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800">
                {NAV.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-blush-500 transition-colors px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <TrendingUp size={13} /> View Store
            </Link>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="w-8 h-8 bg-blush-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-display">A</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
