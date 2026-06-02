'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { subscribeProducts } from '@/lib/products';
import { subscribeAuth } from '@/lib/auth';
import { addToWishlist, removeFromWishlist, subscribeUserWishlistProductIds } from '@/lib/wishlist';
import { User as FirebaseUser } from 'firebase/auth';
import { useCart } from '@/lib/cart';
import { trackCartInterest } from '@/lib/cartInterest';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { items: cartItems, cartCount, addProduct, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    const unsub = subscribeProducts(setProducts);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeUserWishlistProductIds(user?.uid, setWishlistIds);
    return () => unsub();
  }, [user?.uid]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    addProduct(product, 1);
    void trackCartInterest(user, productId, 1);
    setCartOpen(true);
  };
  const wishlist = products.filter((p) => wishlistIds.includes(p.id));

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      window.alert('Please login to add products to wishlist.');
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    if (isWishlisted) await removeFromWishlist(user.uid, productId);
    else await addToWishlist(user, productId);
  };

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
            <div>
              <h2 className="sr-only">Wishlist Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {wishlist.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} isWishlisted={wishlistIds.includes(p.id)} onToggleWishlist={toggleWishlist} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems}
        onRemove={removeItem}
        onUpdateQty={updateQuantity} />
    </>
  );
}
