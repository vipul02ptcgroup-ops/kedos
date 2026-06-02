import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Order Confirmed',
  description: 'View your Kedos order confirmation and purchase summary.',
  path: '/order-success',
  noIndex: true,
  keywords: ['order confirmed', 'purchase summary'],
});

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
