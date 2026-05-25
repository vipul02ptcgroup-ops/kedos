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
import { toSlug } from '@/lib/slug';
import { createReview, subscribeProductReviews, type ProductReview } from '@/lib/reviews';
import { subscribeOrdersForUserIdentity, type FirestoreOrder } from '@/lib/orders';

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read selected image.'));
    reader.readAsDataURL(file);
  });
}

export default function ProductDetailPage() {
  const params = useParams();
  const routeValue = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const routeKey = String(routeValue || '');
  const [products, setProducts] = useState<Product[]>([]);
  const product = useMemo(
    () => products.find((p) => p.id === routeKey || toSlug(p.name) === routeKey),
    [products, routeKey]
  );
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, content: '', images: [] as string[] });
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.length ? product.images : [product.image];
    return images.filter(Boolean);
  }, [product]);
  const activeImage = galleryImages[activeImageIndex] || product?.image || '';
  const normalizedFeatures = useMemo(() => {
    if (!product?.features?.length) return [];
    return product.features
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }, [product?.features]);

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
    if (!user) {
      setOrders([]);
      return;
    }
    const unsub = subscribeOrdersForUserIdentity({ userId: user.uid, email: user.email }, setOrders);
    return () => unsub();
  }, [user?.uid, user?.email]);

  useEffect(() => {
    if (!product?.id) {
      setReviews([]);
      return;
    }
    const unsub = subscribeProductReviews(product.id, setReviews);
    return () => unsub();
  }, [product?.id]);

  useEffect(() => {
    if (user?.displayName && !reviewForm.name) {
      setReviewForm((prev) => ({ ...prev, name: user.displayName || '' }));
    }
  }, [user?.displayName, reviewForm.name]);

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
    const pid = productId || product?.id || routeKey;
    const prod = products.find(p => p.id === pid);
    if (!prod) return;
    setCartItems(prev => {
      const ex = prev.find(i => i.id === pid);
      const addQty = pid === product?.id ? qty : 1;
      if (ex) return prev.map(i => i.id === pid ? { ...i, quantity: i.quantity + addQty } : i);
      return [...prev, { ...prod, quantity: addQty }];
    });
    if (!productId) { setAdded(true); setTimeout(() => setAdded(false), 2000); }
    setCartOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const related = products.filter(p => p.id !== product?.id && p.category === product?.category).slice(0, 4);
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

  const onReviewImagesChange = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 2 - reviewForm.images.length);
    if (selected.length <= 0) return;
    try {
      const urls = await Promise.all(selected.map((f) => readFileAsDataURL(f)));
      setReviewForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 2) }));
    } catch (err: any) {
      setReviewError(err?.message || 'Unable to read selected images.');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setReviewSaving(true);
    setReviewError('');
    try {
      await createReview({
        productId: product.id,
        userId: user?.uid || null,
        userEmail: user?.email || '',
        name: reviewForm.name,
        rating: reviewForm.rating,
        content: reviewForm.content,
        images: reviewForm.images,
        orders,
      });
      setReviewForm({
        name: user?.displayName || '',
        rating: 5,
        content: '',
        images: [],
      });
      setShowReviewForm(false);
    } catch (err: any) {
      setReviewError(err?.message || 'Unable to submit review.');
    } finally {
      setReviewSaving(false);
    }
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

            </div>
          </div>

          <div className="mt-10">
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
              {activeTab === 'features' && normalizedFeatures.length > 0 && (
                <ul className="space-y-2">
                  {normalizedFeatures.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm font-body text-cocoa-700/80">
                      <Check size={15} className="text-sage-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm((prev) => !prev)}
                      className="px-5 py-2.5 rounded-full bg-blush-500 text-white text-sm font-body"
                    >
                      {showReviewForm ? 'Close Review Form' : 'Write a Review'}
                    </button>
                  </div>

                  {showReviewForm && (
                    <form onSubmit={submitReview} className="rounded-2xl border border-cream-200 p-4 bg-cream-50">
                      <h3 className="font-display text-lg text-cocoa-800 mb-3">Write a Review</h3>
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <input
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Your name"
                          className="px-3 py-2.5 rounded-xl border border-cream-200 text-sm bg-white"
                          required
                        />
                        <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-cream-200 text-sm bg-white">
                          {Array.from({ length: 5 }, (_, i) => {
                            const star = i + 1;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                                className="p-0.5"
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              >
                                <Star
                                  size={18}
                                  className={star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                                />
                              </button>
                            );
                          })}
                          <span className="ml-2 text-xs text-cocoa-700/70 font-body">{reviewForm.rating}/5</span>
                        </div>
                      </div>
                      <textarea
                        value={reviewForm.content}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        placeholder="Share your experience..."
                        className="w-full px-3 py-2.5 rounded-xl border border-cream-200 text-sm bg-white resize-none mb-3"
                        required
                      />
                      <div className="flex items-center gap-3 mb-3">
                        <input type="file" accept="image/*" multiple onChange={(e) => onReviewImagesChange(e.target.files)} />
                        <span className="text-xs text-cocoa-700/60 font-body">Up to 2 images</span>
                      </div>
                      {!!reviewForm.images.length && (
                        <div className="flex gap-2 mb-3">
                          {reviewForm.images.map((img) => (
                            <div key={img} className="relative">
                              <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />
                              <button
                                type="button"
                                onClick={() => setReviewForm((prev) => ({ ...prev, images: prev.images.filter((x) => x !== img) }))}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-cream-300 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {reviewError && <p className="text-xs text-red-600 font-body mb-2">{reviewError}</p>}
                      <button disabled={reviewSaving} className="px-5 py-2.5 rounded-full bg-blush-500 text-white text-sm font-body disabled:opacity-60">
                        {reviewSaving ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}

                  {reviews.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {reviews.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-cream-200 bg-white p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 bg-blush-100 rounded-full flex items-center justify-center font-display text-sm text-blush-700">
                              {(r.name || 'U')[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm font-body text-cocoa-800 truncate">{r.name}</p>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-cocoa-700/80 font-body leading-relaxed">{r.content}</p>
                          {!!r.images?.length && (
                            <div className="flex gap-2 mt-3">
                              {r.images.map((img) => (
                                <img key={img} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {reviews.length === 0 && <p className="text-sm text-cocoa-700/60 font-body">No reviews yet. Be the first to review.</p>}
                </div>
              )}
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
