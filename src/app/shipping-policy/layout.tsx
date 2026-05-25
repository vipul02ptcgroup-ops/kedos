import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Shipping Policy - Kedos',
  description: 'Read Kedos shipping policy, delivery coverage, processing timelines, and tracking details.',
  path: '/shipping-policy',
});

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

