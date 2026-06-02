import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Coupons',
  description: 'Create and manage Kedos discounts, offers, and coupon codes.',
  path: '/admin/coupons',
  noIndex: true,
  keywords: ['coupon management', 'discount codes'],
});

export default function AdminCouponsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
