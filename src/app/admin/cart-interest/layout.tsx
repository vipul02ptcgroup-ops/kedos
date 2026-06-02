import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Cart Interest',
  description: 'Review products customers add to carts on Kedos.',
  path: '/admin/cart-interest',
  noIndex: true,
  keywords: ['cart interest', 'cart analytics'],
});

export default function AdminCartInterestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
