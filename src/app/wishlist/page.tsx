'use client';
import { useState } from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { PRODUCTS, CartItem } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlist] = useState(PRODUCTS.slice(0, 4));
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    setCartItems(prev => {
      const ex = prev.find(i => i.id === productId);
      if (ex) return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-cream-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-cocoa-800">My Wishlist</h1>
              <p className="text-cocoa-700/60 font-body text-sm mt-1">{wishlist.length} saved items</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-cream-200 bg-white rounded-xl text-sm font-body text-cocoa-700 hover:bg-cream-50 transition-colors">
              <ShoppingBag size={15} /> Add All to Cart
            </button>
          </div>
          {wishlist.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={64} className="text-cream-300 mx-auto mb-4" />
              <h2 className="font-display text-2xl text-cocoa-800 mb-3">Your wishlist is empty</h2>
              <Link href="/products" className="inline-flex bg-blush-500 text-white px-6 py-3 rounded-full font-body font-medium hover:bg-blush-600 transition-colors">
                Discover Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {wishlist.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems}
        onRemove={id => setCartItems(prev => prev.filter(i => i.id !== id))}
        onUpdateQty={(id, qty) => {
          if (qty < 1) setCartItems(prev => prev.filter(i => i.id !== id));
          else setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
        }} />
    </>
  );
}
