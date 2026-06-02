import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Orders',
  description: 'Manage Kedos orders, status updates, and fulfillment.',
  path: '/admin/orders',
  noIndex: true,
  keywords: ['order management', 'fulfillment'],
});

export default function AdminOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
