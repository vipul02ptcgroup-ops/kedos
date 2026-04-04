'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="px-2.5 py-1 bg-blush-500 text-white text-[11px] font-medium rounded-full font-body">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="px-2.5 py-1 bg-sage-500 text-white text-[11px] font-medium rounded-full font-body">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="px-2.5 py-1 bg-cocoa-700 text-white text-[11px] font-medium rounded-full font-body">
              Out of Stock
            </span>
          )}
        </div>
        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blush-50 transition-colors">
            <Heart size={16} className="text-blush-500" />
          </button>
          <Link href={`/products/${product.id}`}
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-blush-50 transition-colors">
            <Eye size={16} className="text-cocoa-700" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[11px] text-sage-600 font-medium uppercase tracking-wider font-body mb-1">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display text-base text-cocoa-800 leading-snug hover:text-blush-600 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Age range */}
        {product.ageRange && (
          <p className="text-[11px] text-cocoa-700/50 font-body mb-2">Ages: {product.ageRange}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={12}
                className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-cocoa-700/60 font-body">({product.reviews})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-cocoa-800">₹{product.price.toFixed(0)}</span>
            {product.originalPrice && (
              <span className="text-sm text-cocoa-700/40 line-through font-body">₹{product.originalPrice.toFixed(0)}</span>
            )}
          </div>
          <button
            onClick={() => product.inStock && onAddToCart?.(product.id)}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors font-body
              ${product.inStock
                ? 'bg-blush-500 hover:bg-blush-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingBag size={13} />
            {product.inStock ? 'Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
