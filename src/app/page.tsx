'use client';
import Link from 'next/link';
import { ArrowRight, Shield, Leaf, Truck, Heart, Star, ChevronRight, Baby, Shirt, Puzzle, Bed, Backpack, Moon, Bath, Milk } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useState } from 'react';
import { CartItem } from '@/lib/data';

const FEATURES = [
  { icon: Shield, title: 'Safety Certified', desc: 'Every product meets the highest safety standards' },
  { icon: Leaf, title: '100% Organic', desc: 'Natural materials, gentle on delicate baby skin' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over ₹999' },
  { icon: Heart, title: 'Parent Tested', desc: 'Loved and approved by thousands of parents' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai', text: 'Absolutely love the quality! My baby sleeps so well in the bamboo swaddles.', rating: 5 },
  { name: 'Anjali M.', location: 'Pune', text: 'Fast shipping, beautiful packaging. Every item feels premium and safe.', rating: 5 },
  { name: 'Ritu K.', location: 'Bangalore', text: 'Best baby store online! The carrier is a lifesaver for our daily walks.', rating: 5 },
];

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main>
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-blush-400/20">
          {/* Decorative blobs */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-blush-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-sage-400/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-48 h-48 bg-sky-400/15 rounded-full blur-2xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-blush-100 text-blush-600 px-4 py-1.5 rounded-full text-sm font-medium font-body mb-6">
                <Star size={14} className="fill-blush-500 text-blush-500" />
                Trusted by 10,000+ Happy Parents
              </div>
              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl text-cocoa-800 leading-tight mb-6">
                Little <span className="text-blush-500 italic">Ones</span>,<br />Big<br />Adventures
              </h1>
              <p className="text-lg text-cocoa-700/70 font-body leading-relaxed mb-8 max-w-md">
                Discover thoughtfully chosen baby products that blend safety, comfort, and joy — crafted for every precious milestone.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products"
                  className="inline-flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-8 py-4 rounded-full font-medium text-base transition-all hover:shadow-lg hover:shadow-blush-200 font-body">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link href="/about"
                  className="inline-flex items-center gap-2 border-2 border-cocoa-800/20 text-cocoa-800 hover:border-blush-400 hover:text-blush-600 px-8 py-4 rounded-full font-medium text-base transition-colors font-body">
                  Our Story
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                {[['10k+', 'Happy Parents'], ['500+', 'Products'], ['4.9★', 'Average Rating']].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-display text-2xl text-cocoa-800">{val}</div>
                    <div className="text-xs text-cocoa-700/60 font-body">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image collage */}
            <div className="relative hidden lg:block animate-fade-up delay-200">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-blush-200/40 rounded-[40px] rotate-6" />
                <img
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80"
                  alt="Happy baby"
                  className="relative rounded-[32px] w-full h-full object-cover shadow-2xl"
                />
                {/* Floating cards */}
                <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center">
                    <Leaf size={22} className="text-sage-600" />
                  </div>
                  <div>
                    <div className="font-display text-sm text-cocoa-800">100% Organic</div>
                    <div className="text-xs text-cocoa-700/60 font-body">All materials tested</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-xl p-3">
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <div className="text-xs font-body text-cocoa-700">4.9/5 Rating</div>
                  <div className="text-[10px] text-cocoa-700/50 font-body">12,000+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl text-cocoa-800">Shop by Category</h2>
                <p className="text-cocoa-700/60 font-body mt-1">Everything your little one needs</p>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-1 text-blush-500 hover:text-blush-600 text-sm font-medium font-body transition-colors">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { name: 'Clothing', icon: Shirt, color: 'bg-blush-400' },
                { name: 'Toys', icon: Puzzle, color: 'bg-sky-100' },
                { name: 'Nursery', icon: Bed, color: 'bg-cream-200' },
                { name: 'Gear', icon: Backpack, color: 'bg-blush-400' },
                { name: 'Bedding', icon: Moon, color: 'bg-purple-100' },
                { name: 'Bath', icon: Bath, color: 'bg-blue-100' },
                { name: 'Feeding', icon: Milk, color: 'bg-amber-100' },
              ].map(cat => {
                const Icon = cat.icon; // 👈 important

                return (
                  <Link
                    key={cat.name}
                    href={`/products?category=${cat.name}`}
                    className={`${cat.color} relative rounded-2xl p-5 text-center 
  transition-all duration-300 ease-out 
  hover:shadow-xl hover:-translate-y-2 hover:scale-[1.03] 
  cursor-pointer group overflow-hidden`}
                  >
                    {/* Soft gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon */}
                    <div className="relative z-10 w-14 h-14 mx-auto mb-3 rounded-xl 
    flex items-center justify-center 
    bg-white/70 backdrop-blur-sm 
    shadow-sm group-hover:shadow-md transition-all">

                      <Icon
                        size={26}
                        className="text-cocoa-800 group-hover:text-blush-500 transition-colors duration-300"
                      />
                    </div>

                    {/* Category name */}
                    <div className="relative z-10 text-sm font-semibold text-cocoa-800 font-body tracking-tight">
                      {cat.name}
                    </div>

                    {/* Subtle underline animation */}
                    <div className="h-[2px] w-0 bg-black mx-auto mt-2 
                      group-hover:w-6 transition-all duration-300 rounded-full" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl text-cocoa-800">Best Sellers</h2>
                <p className="text-cocoa-700/60 font-body mt-1">Parents love these</p>
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-1 text-blush-500 hover:text-blush-600 text-sm font-medium font-body">
                See all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-cocoa-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map(f => (
                <div key={f.title} className="text-center">
                  <div className="w-14 h-14 bg-blush-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <f.icon size={26} className="text-blush-400" />
                  </div>
                  <h3 className="font-display text-base text-cream-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-cream-200/60 font-body leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl text-cocoa-800">New Arrivals</h2>
                <p className="text-cocoa-700/60 font-body mt-1">Fresh finds for your little one</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS.slice(4, 8).map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>

        {/* Banner CTA */}
        <section className="py-20 bg-gradient-to-r from-blush-400/30 via-cream-100 to-sage-400/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Baby size={48} className="text-blush-500 mx-auto mb-6 animate-bounce-soft" />
            <h2 className="font-display text-4xl lg:text-5xl text-cocoa-800 mb-4">
              Every Product Tells a <span className="text-blush-500 italic">Story</span>
            </h2>
            <p className="text-lg text-cocoa-700/70 font-body mb-8 max-w-2xl mx-auto">
              We hand-select every item with love, ensuring it meets our strict standards for safety, sustainability, and pure delight.
            </p>
            <Link href="/about"
              className="inline-flex items-center gap-2 bg-cocoa-800 text-cream-100 hover:bg-cocoa-900 px-8 py-4 rounded-full font-medium text-base transition-colors font-body">
              Learn Our Story <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl lg:text-4xl text-cocoa-800 text-center mb-12">What Parents Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-cocoa-700/80 font-body text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blush-200 rounded-full flex items-center justify-center font-display text-blush-700">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-cocoa-800 font-body">{t.name}</div>
                      <div className="text-xs text-cocoa-700/50 font-body">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))}
        onUpdateQty={(id, qty) => {
          if (qty < 1) setCartItems(prev => prev.filter(i => i.id !== id));
          else setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
        }}
      />
    </>
  );
}
