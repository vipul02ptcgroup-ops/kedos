import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Order Details',
  description: 'Review your Kedos order status, items, and tracking updates.',
  path: '/profile/orders',
  noIndex: true,
  keywords: ['order details', 'order tracking'],
});

export default function ProfileOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
