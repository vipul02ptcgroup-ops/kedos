export type ProductVariant = {
  id: string;
  label: string;
  color?: string;
  size?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  inStock: boolean;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  features?: string[];
  ageRange?: string;
  inStock: boolean;
  newArrival?: boolean;
  variants?: ProductVariant[];
};

export type CartItem = Product & {
  cartItemId: string;
  parentProductId: string;
  quantity: number;
  selectedVariant?: ProductVariant;
};

export function getVariantLabel(variant: Pick<ProductVariant, 'label' | 'color' | 'size'>): string {
  const label = String(variant.label || '').trim();
  if (label) return label;

  return [variant.color, variant.size]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' / ');
}

export function getProductDefaultVariant(product: Pick<Product, 'variants'> | null | undefined): ProductVariant | null {
  if (!product?.variants?.length) return null;
  return product.variants.find((variant) => variant.inStock) || product.variants[0] || null;
}

export function getEffectiveProductPrice(product: Pick<Product, 'price' | 'variants'>, variant?: ProductVariant | null): number {
  return Number(variant?.price ?? getProductDefaultVariant(product)?.price ?? product.price ?? 0);
}

export function getEffectiveProductOriginalPrice(
  product: Pick<Product, 'originalPrice' | 'variants'>,
  variant?: ProductVariant | null
): number | undefined {
  const value = variant?.originalPrice ?? getProductDefaultVariant(product)?.originalPrice ?? product.originalPrice;
  return value === undefined ? undefined : Number(value);
}

export function getEffectiveProductImages(
  product: Pick<Product, 'image' | 'images' | 'variants'>,
  variant?: ProductVariant | null
): string[] {
  const defaultVariant = getProductDefaultVariant(product);
  const source = variant || defaultVariant;
  const images = source?.images?.length ? source.images : source?.image ? [source.image] : product.images?.length ? product.images : [product.image];
  return images.filter(Boolean);
}

export function getEffectiveProductImage(
  product: Pick<Product, 'image' | 'images' | 'variants'>,
  variant?: ProductVariant | null
): string {
  return getEffectiveProductImages(product, variant)[0] || '';
}

export function getEffectiveProductStock(product: Pick<Product, 'inStock' | 'variants'>, variant?: ProductVariant | null): boolean {
  return Boolean(variant?.inStock ?? getProductDefaultVariant(product)?.inStock ?? product.inStock);
}

export function buildCartItemId(productId: string, variantId?: string): string {
  const cleanProductId = String(productId || '').trim();
  const cleanVariantId = String(variantId || '').trim();
  return cleanVariantId ? `${cleanProductId}::${cleanVariantId}` : cleanProductId;
}

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: 'active' | 'inactive';
};

export const CATEGORIES = ['All', 'Clothing', 'Toys', 'Nursery', 'Gear', 'Bedding', 'Bath'];

export const ORDERS: Order[] = [];

export const CUSTOMERS: Customer[] = [];
