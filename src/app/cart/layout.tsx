import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Shopping Cart',
  description: 'Review your Kedos shopping cart.',
  path: '/cart',
  noIndex: true,
  keywords: ['shopping cart', 'checkout cart'],
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
