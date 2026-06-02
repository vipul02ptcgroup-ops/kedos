'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, Menu, X, Heart } from 'lucide-react';
import { getUserRole, subscribeAuth } from '@/lib/auth';

interface HeaderProps {
  cartCount?: number;
  onCartOpen?: () => void;
}

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header({ cartCount = 0, onCartOpen }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }
      setIsLoggedIn(true);
      try {
        const role = await getUserRole(user.uid);
        setIsAdmin(role === 'admin' || role === 'superadmin');
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-cocoa-800 text-cream-100 text-xs text-center py-2 px-4 font-body tracking-wide">
        We're currently undergoing maintenance. Please check back soon.
      </div>

      <header className="sticky top-0 z-50 bg-blush-400/30 backdrop-blur-sm border-b border-cream-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="Kedos home">
              <Image
                src="/Images/Logo.png"
                alt="Kedos baby products logo"
                width={112}
                height={56}
                priority
                sizes="112px"
                className="h-14 w-auto"
              />
              <span className="sr-only">Kedos</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV.map(n => (
                <Link key={n.href} href={n.href}
                  className="text-sm font-body font-medium text-black-800 hover:text-cocoa-700 transition-colors relative group">
                  {n.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-cocoa-700 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="text-sm font-body font-medium text-blush-600 hover:text-blush-700 transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/products"
                aria-label="Search products"
                className="flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700"
              >
                <Search size={18} />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700"
              >
                <Heart size={18} />
              </Link>
              <Link href="/profile" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700">
                <User size={18} />
              </Link>
              {!isLoggedIn && (
                <>
                  <Link href="/login" className="hidden md:inline-flex px-3 py-2 text-sm font-medium text-cocoa-700 hover:text-blush-600 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="hidden md:inline-flex px-4 py-2 rounded-full text-sm font-medium bg-blush-500 text-white hover:bg-blush-600 transition-colors">
                    Register
                  </Link>
                </>
              )}
              <button onClick={onCartOpen}
                className="relative flex items-center gap-1.5 bg-cocoa-700 hover:bg-blush-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cocoa-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-cream-50 border-t border-cream-200 px-4 py-4">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                className="block py-3 text-base font-medium text-cocoa-800 border-b border-cream-200 last:border-0">
                {n.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-base font-medium text-cocoa-800 border-b border-cream-200"
            >
              Wishlist
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-base font-medium text-cocoa-800 border-b border-cream-200"
            >
              Profile
            </Link>
            <div className="flex gap-4 pt-4">
              {!isLoggedIn && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-blush-600 font-medium">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="text-sm text-blush-600 font-medium">Register</Link>
                </>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm text-blush-600 font-medium">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
