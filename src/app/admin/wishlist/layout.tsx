import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Wishlist',
  description: 'Review Kedos wishlist activity and saved products.',
  path: '/admin/wishlist',
  noIndex: true,
  keywords: ['wishlist analytics', 'saved products'],
});

export default function AdminWishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
