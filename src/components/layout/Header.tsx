'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, Heart, Star } from 'lucide-react';

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

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-cocoa-800 text-cream-100 text-xs text-center py-2 px-4 font-body tracking-wide">
        🌿 Free shipping on orders over ₹999 &nbsp;·&nbsp; Organic & Safe for Baby
      </div>

      <header className="sticky top-0 z-50 bg-blush-400/30 backdrop-blur-sm border-b border-cream-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img src='/Images/Logo.png' className='h-14 w-auto'/>
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
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700">
                <Search size={18} />
              </button>
              <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700">
                <Heart size={18} />
              </button>
              <Link href="/profile" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-cocoa-700">
                <User size={18} />
              </Link>
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
            <div className="flex gap-4 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-blush-600 font-medium">Login</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="text-sm text-blush-600 font-medium">Register</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
