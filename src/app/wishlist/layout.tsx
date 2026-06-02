import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Wishlist',
  description: 'Manage your saved Kedos products.',
  path: '/wishlist',
  noIndex: true,
  keywords: ['wishlist', 'saved products'],
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
