'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Star, Shield, Leaf, Truck, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import { PRODUCTS, CartItem } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [added, setAdded] = useState(false);

  const addToCart = (productId?: string) => {
    const pid = productId || id as string;
    const prod = PRODUCTS.find(p => p.id === pid);
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
  const related = PRODUCTS.filter(p => p.id !== id && p.category === product?.category).slice(0, 4);

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
            <div>
              <div className="aspect-square rounded-3xl overflow-hidden bg-cream-100 shadow-md">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[product.image, product.image, product.image, product.image].map((img, i) => (
                  <div key={i} className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-colors ${i === 0 ? 'border-blush-400' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
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
                  👶 Suitable for ages: <strong>{product.ageRange}</strong>
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
                <button className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-cream-200 hover:border-blush-400 hover:bg-blush-50 transition-colors">
                  <Heart size={18} className="text-cocoa-700" />
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
                {related.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
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
