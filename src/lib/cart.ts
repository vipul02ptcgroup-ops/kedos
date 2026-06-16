'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildCartItemId, type CartItem, type Product, type ProductVariant } from '@/lib/data';

const CART_STORAGE_KEY = 'kedos_cart_items';
const CART_EVENT = 'kedos:cart:update';

function safeReadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === 'string' && Number(item.quantity) > 0)
      .map((item) => {
        const selectedVariant = item?.selectedVariant && typeof item.selectedVariant === 'object'
          ? {
              ...item.selectedVariant,
              id: String(item.selectedVariant.id || '').trim(),
            }
          : undefined;
        return {
          ...item,
          cartItemId: String(item?.cartItemId || '').trim() || buildCartItemId(String(item.id || ''), selectedVariant?.id),
          parentProductId: String(item?.parentProductId || '').trim() || String(item.id || ''),
          selectedVariant,
        } as CartItem;
      });
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

  const addProduct = (product: Product, quantity = 1, selectedVariant?: ProductVariant) => {
    if (!product?.id || quantity < 1) return;
    const cartItemId = buildCartItemId(product.id, selectedVariant?.id);
    setAndPersist((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          ...product,
          price: Number(selectedVariant?.price ?? product.price ?? 0),
          originalPrice: selectedVariant?.originalPrice ?? product.originalPrice,
          image: selectedVariant?.image || product.image,
          images: selectedVariant?.images?.length ? selectedVariant.images : product.images,
          inStock: selectedVariant?.inStock ?? product.inStock,
          cartItemId,
          parentProductId: product.id,
          quantity,
          selectedVariant,
        },
      ];
    });
  };

  const removeItem = (cartItemId: string) => {
    setAndPersist((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setAndPersist((prev) => {
      if (quantity < 1) return prev.filter((i) => i.cartItemId !== cartItemId);
      return prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i));
    });
  };

  const clearCart = () => {
    writeCart([]);
    setItems([]);
  };

  return { items, cartCount, addProduct, removeItem, updateQuantity, clearCart };
}
