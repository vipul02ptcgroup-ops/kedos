'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartItem } from '@/lib/data';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i));
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main>{children}</main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
      />
    </>
  );
}
