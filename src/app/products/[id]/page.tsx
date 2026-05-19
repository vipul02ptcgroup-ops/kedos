'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Star, Shield, Leaf, Truck, ChevronRight, ChevronLeft, Minus, Plus, Check } from 'lucide-react';
import { Product, CartItem } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { subscribeProducts } from '@/lib/products';
import ProductSeo from '@/components/seo/ProductSeo';
import { subscribeAuth } from '@/lib/auth';
import { addToWishlist, removeFromWishlist, subscribeUserWishlistProductIds } from '@/lib/wishlist';
import { User as FirebaseUser } from 'firebase/auth';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.length ? product.images : [product.image];
    return images.filter(Boolean);
  }, [product]);
  const activeImage = galleryImages[activeImageIndex] || product?.image || '';

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

  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (galleryImages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % galleryImages.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [galleryImages.length]);

  const addToCart = (productId?: string) => {
    const pid = productId || id as string;
    const prod = products.find(p => p.id === pid);
    if (!prod) return;
    setCartItems(prev => {
      const ex = prev.find(i => i.id === pid);
      const addQty = pid === id ? qty : 1;
      if (ex) return prev.map(i => i.id === pid ? { ...i, quantity: i.quantity + addQty } : i);
      return [...prev, { ...prod, quantity: addQty }];
    });
    if (!productId) { setAdded(true); setTimeout(() => setAdded(false), 2000); }
    setCartOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const related = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 4);
  const isWishlisted = !!product && wishlistIds.includes(product.id);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      window.alert('Please login to add products to wishlist.');
      return;
    }
    const current = wishlistIds.includes(productId);
    if (current) await removeFromWishlist(user.uid, productId);
    else await addToWishlist(user, productId);
  };

  const goToPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % galleryImages.length);
  };

  if (!product) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="font-display text-2xl text-cocoa-800 mb-4">Product not found</h2>
        <Link href="/products" className="text-blush-500 font-body">Browse all products</Link>
      </div>
    </div>
  );

  return (
    <>
      <ProductSeo product={product} />
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-cream-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm font-body">
            <Link href="/" className="text-cocoa-700/50 hover:text-blush-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="text-cocoa-700/30" />
            <Link href="/products" className="text-cocoa-700/50 hover:text-blush-500 transition-colors">Products</Link>
            <ChevronRight size={14} className="text-cocoa-700/30" />
            <span className="text-cocoa-800">{product.name}</span>
          </div>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-100 shadow-md group">
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-cocoa-800 shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                      aria-label="Previous product image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-cocoa-800 shadow-md opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                      aria-label="Next product image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                      {galleryImages.map((img, index) => (
                        <button
                          key={`${img}-dot`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`h-2 rounded-full transition-all ${index === activeImageIndex ? 'w-6 bg-blush-500' : 'w-2 bg-cocoa-800/25 hover:bg-cocoa-800/40'}`}
                          aria-label={`Show product image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-cream-100 transition-colors sm:h-24 sm:w-24 ${index === activeImageIndex ? 'border-blush-400' : 'border-transparent hover:border-cream-300'}`}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              {product.badge && (
                <span className="inline-block px-3 py-1 bg-blush-100 text-blush-600 text-xs font-medium rounded-full font-body mb-3">{product.badge}</span>
              )}
              <p className="text-sm text-sage-600 font-medium font-body uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="font-display text-3xl lg:text-4xl text-cocoa-800 mb-3 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-body text-cocoa-700">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {product.ageRange && (
                <div className="inline-flex items-center gap-1.5 bg-cream-200 px-3 py-1.5 rounded-lg text-sm font-body text-cocoa-700 mb-4">
                   Suitable for ages: <strong>{product.ageRange}</strong>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-4xl text-cocoa-800">₹{product.price.toFixed(0)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-cocoa-700/40 line-through font-body">₹{product.originalPrice.toFixed(0)}</span>
                    <span className="text-sm bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-body font-medium">
                      Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className={`flex items-center gap-2 mb-6 text-sm font-body ${product.inStock ? 'text-sage-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-sage-500' : 'bg-red-500'}`} />
                {product.inStock ? 'In Stock — Ready to Ship' : 'Out of Stock'}
              </div>

              {/* Qty + Cart */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-3 bg-cream-100 rounded-full px-4 py-2.5">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream-300 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-display text-base">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream-300 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => addToCart()} disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-medium transition-all font-body text-base
                    ${product.inStock ? 'bg-blush-500 hover:bg-blush-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowedx'}`}>
                  {added ? <><Check size={18} /> Added!</> : <><ShoppingBag size={18} /> Add to Cart</>}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-cream-200 hover:border-blush-400 hover:bg-blush-50 transition-colors"
                >
                  <Heart size={18} className={isWishlisted ? 'fill-blush-500 text-blush-500' : 'text-cocoa-700'} />
                </button>
              </div>

              <Link href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-cocoa-800 text-cream-100 hover:bg-cocoa-900 font-medium transition-colors font-body text-base mb-6">
                Buy Now
              </Link>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Shield, text: 'Safety Tested' },
                  { icon: Leaf, text: 'Organic' },
                  { icon: Truck, text: 'Fast Ship' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex flex-col items-center gap-1.5 bg-cream-100 rounded-xl p-3 text-center">
                    <Icon size={20} className="text-sage-600" />
                    <span className="text-xs font-body text-cocoa-700">{text}</span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="border-b border-cream-200 flex gap-6 mb-4">
                {['description', 'features', 'reviews'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium font-body capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab ? 'border-blush-500 text-blush-600' : 'border-transparent text-cocoa-700/60 hover:text-cocoa-800'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div>
                {activeTab === 'description' && (
                  <p className="text-sm text-cocoa-700/80 font-body leading-relaxed">{product.description}</p>
                )}
                {activeTab === 'features' && product.features && (
                  <ul className="space-y-2">
                    {product.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm font-body text-cocoa-700/80">
                        <Check size={15} className="text-sage-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {[
                      { name: 'Priya S.', rating: 5, text: 'Amazing quality! My baby loves it.' },
                      { name: 'Meena R.', rating: 4, text: 'Good product, fast delivery.' },
                    ].map(r => (
                      <div key={r.name} className="border-b border-cream-200 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-blush-100 rounded-full flex items-center justify-center font-display text-sm text-blush-700">{r.name[0]}</div>
                          <span className="font-medium text-sm font-body text-cocoa-800">{r.name}</span>
                          <div className="flex ml-auto">
                            {Array.from({ length: r.rating }, (_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                          </div>
                        </div>
                        <p className="text-sm text-cocoa-700/70 font-body">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl text-cocoa-800 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} isWishlisted={wishlistIds.includes(p.id)} onToggleWishlist={toggleWishlist} />)}
              </div>
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
