import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Shipping Policy',
  description: 'Read Kedos shipping policy, delivery coverage, processing timelines, and tracking details.',
  path: '/shipping-policy',
  keywords: ['shipping policy', 'delivery policy', 'shipping information'],
});

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
