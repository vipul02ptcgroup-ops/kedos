'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Star,
  Menu, X, Bell, ChevronDown, TrendingUp, LogOut, BarChart2
} from 'lucide-react';
import { isAdminAuthenticated, adminLogout } from '@/lib/adminAuth';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function handleLogout(router: ReturnType<typeof useRouter>) {
  adminLogout();
  router.replace('/admin/login');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Guard: redirect unauthenticated users to admin login
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace('/admin/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="animate-spin h-8 w-8 text-blush-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm font-body">Verifying access…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-body overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-cocoa-900 flex flex-col transition-all duration-300 shrink-0`}
        style={{ backgroundColor: '#1a0f08' }}>
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  active ? 'bg-blush-500 text-white' : 'text-cream-200/50 hover:bg-white/10 hover:text-cream-100'
                }`}>
                <item.icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-16 bg-cocoa-800 text-cream-100 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors`}
            onClick={() => handleLogout(router)}>
            <div className="w-8 h-8 bg-blush-400 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-display">A</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-cream-100 truncate">Admin User</div>
                <div className="text-[10px] text-cream-200/40">admin@Kedos.in</div>
              </div>
            )}
            {sidebarOpen && <LogOut size={14} className="text-cream-200/40 shrink-0" />}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blush-500 rounded-full" />
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

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
