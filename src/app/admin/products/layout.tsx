import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Products',
  description: 'Manage Kedos products, pricing, and catalog content.',
  path: '/admin/products',
  noIndex: true,
  keywords: ['product management', 'catalog admin'],
});

export default function AdminProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
