import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Baby Products Online',
  description: 'Shop curated baby clothing, toys, nursery essentials, bedding, bath products, and baby gear at Kedos.',
  path: '/products',
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
