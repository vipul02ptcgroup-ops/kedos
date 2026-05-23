import { Product } from '@/lib/data';

export function toSlug(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getProductSlug(product: Pick<Product, 'name' | 'id'>): string {
  const slug = toSlug(product.name);
  return slug || String(product.id || '').trim();
}
