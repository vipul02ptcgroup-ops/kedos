'use client';
import Link from 'next/link';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { CartItem } from '@/lib/data';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

export default function CartDrawer({ open, onClose, items, onRemove, onUpdateQty }: CartDrawerProps) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <>
      {/* Overlay */}
      {open && <div className="cart-overlay fixed inset-0 z-50" onClick={onClose} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-cream-50 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-blush-500" />
            <h2 className="font-display text-xl text-cocoa-800">Your Cart</h2>
            <span className="ml-1 text-xs bg-blush-100 text-blush-600 px-2 py-0.5 rounded-full font-body font-medium">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors">
            <X size={18} className="text-cocoa-700" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-24 h-24 bg-cream-200 rounded-full flex items-center justify-center">
                <ShoppingBag size={40} className="text-cream-300" />
              </div>
              <h3 className="font-display text-xl text-cocoa-800">Your cart is empty</h3>
              <p className="text-sm text-cocoa-700/60 font-body">Start adding some tiny treasures for your little one!</p>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-blush-500 text-white rounded-full text-sm font-medium font-body hover:bg-blush-600 transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-body text-sm font-medium text-cocoa-800 line-clamp-2 leading-snug">{item.name}</h4>
                <p className="text-xs text-sage-600 font-body mt-0.5">{item.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display text-base text-cocoa-800">₹{(item.price * item.quantity).toFixed(0)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-cream-200 hover:bg-cream-300 transition-colors">
                      <Minus size={11} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium font-body">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-cream-200 hover:bg-cream-300 transition-colors">
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => onRemove(item.id)} className="self-start text-cocoa-700/30 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-cream-200 bg-white space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-body text-cocoa-700">
                <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-cocoa-700">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-sage-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {subtotal < 999 && (
                <p className="text-xs text-blush-500 font-body">Add ₹{(999 - subtotal).toFixed(0)} more for free shipping!</p>
              )}
              <div className="flex justify-between text-base font-medium font-body text-cocoa-800 pt-1 border-t border-cream-200">
                <span>Total</span><span className="font-display">₹{total.toFixed(0)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-blush-500 hover:bg-blush-600 text-white py-3.5 rounded-full font-medium text-sm transition-colors font-body">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <button onClick={onClose} className="w-full text-center text-sm text-cocoa-700/60 hover:text-cocoa-800 transition-colors font-body py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
