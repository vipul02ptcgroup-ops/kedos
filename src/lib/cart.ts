'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '@/lib/data';

const CART_STORAGE_KEY = 'kedos_cart_items';
const CART_EVENT = 'kedos:cart:update';

function safeReadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === 'string' && Number(item.quantity) > 0);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(safeReadCart());
    const onChange = () => setItems(safeReadCart());
    window.addEventListener(CART_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CART_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const setAndPersist = (updater: (prev: CartItem[]) => CartItem[]) => {
    const next = updater(safeReadCart());
    writeCart(next);
    setItems(next);
  };

  const addProduct = (product: Product, quantity = 1) => {
    if (!product?.id || quantity < 1) return;
    setAndPersist((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (id: string) => {
    setAndPersist((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setAndPersist((prev) => {
      if (quantity < 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  };

  const clearCart = () => {
    writeCart([]);
    setItems([]);
  };

  return { items, cartCount, addProduct, removeItem, updateQuantity, clearCart };
}
