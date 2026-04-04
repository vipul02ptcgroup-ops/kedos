'use client';
import { useState } from 'react';
import { SlidersHorizontal, Grid3x3, List, ChevronDown, Search } from 'lucide-react';
import { PRODUCTS, CATEGORIES, CartItem } from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const filtered = PRODUCTS
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-cream-50">
        {/* Page header */}
        <div className="bg-cocoa-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl text-cream-100 mb-2">Our Products</h1>
            <p className="text-cream-200/70 font-body">Handpicked with love for your little one</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search + Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-700/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-cream-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cocoa-700/50 pointer-events-none" />
              </div>
              <button onClick={() => setGridView(!gridView)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-cream-200 bg-white hover:bg-cream-100 transition-colors">
                {gridView ? <List size={16} className="text-cocoa-700" /> : <Grid3x3 size={16} className="text-cocoa-700" />}
              </button>
              <button onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm font-body hover:bg-cream-100 transition-colors text-cocoa-800">
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar filter */}
            <aside className={`${filterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 shrink-0`}>
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display text-sm text-cocoa-800 mb-3">Category</h3>
                  <div className="space-y-1.5">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors ${
                          selectedCategory === cat ? 'bg-blush-100 text-blush-700 font-medium' : 'text-cocoa-700/70 hover:bg-cream-100'
                        }`}>
                        {cat}
                        <span className="float-right text-xs text-cocoa-700/40">
                          {cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm text-cocoa-800 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input type="range" min="0" max="500" step="10"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-blush-500" />
                    <div className="flex justify-between text-xs text-cocoa-700/60 font-body">
                      <span>₹0</span><span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm text-cocoa-800 mb-3">Availability</h3>
                  <label className="flex items-center gap-2 text-sm font-body text-cocoa-700/70 cursor-pointer">
                    <input type="checkbox" className="accent-blush-500" />
                    In Stock Only
                  </label>
                </div>
              </div>
            </aside>

            {/* Products grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-cocoa-700/60 font-body">{filtered.length} products</p>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl text-cocoa-800 mb-2">No products found</h3>
                  <p className="text-cocoa-700/60 font-body text-sm">Try a different search or category</p>
                </div>
              ) : (
                <div className={gridView
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
                }>
                  {filtered.map(product => (
                    gridView
                      ? <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                      : (
                        <div key={product.id} className="bg-white rounded-2xl flex gap-4 p-4 shadow-sm hover:shadow-md transition-shadow">
                          <img src={product.image} alt={product.name} className="w-32 h-32 rounded-xl object-cover shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-sage-600 font-medium font-body uppercase tracking-wide mb-1">{product.category}</p>
                            <h3 className="font-display text-lg text-cocoa-800 mb-1">{product.name}</h3>
                            <p className="text-sm text-cocoa-700/60 font-body line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-display text-xl text-cocoa-800">₹{product.price.toFixed(0)}</span>
                              <button onClick={() => addToCart(product.id)}
                                className="px-4 py-2 bg-blush-500 text-white rounded-full text-sm font-medium font-body hover:bg-blush-600 transition-colors">
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems}
        onRemove={id => setCartItems(prev => prev.filter(i => i.id !== id))}
        onUpdateQty={(id, qty) => {
          if (qty < 1) setCartItems(prev => prev.filter(i => i.id !== id));
          else setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
        }}
      />
    </>
  );
}
