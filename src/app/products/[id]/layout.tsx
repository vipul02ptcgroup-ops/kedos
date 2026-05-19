import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Product Details',
  description: 'View product details, images, pricing, availability, and related baby products from Kedos.',
  path: '/products',
});

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
