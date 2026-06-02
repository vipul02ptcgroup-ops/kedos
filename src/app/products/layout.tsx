import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Baby Products',
  description: 'Shop curated baby clothing, toys, nursery essentials, bedding, bath products, and baby gear at Kedos.',
  path: '/products',
  keywords: ['baby products', 'baby clothing', 'baby toys', 'nursery essentials'],
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
