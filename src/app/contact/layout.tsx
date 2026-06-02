import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Contact',
  description: 'Contact Kedos for order enquiries, product information, returns, partnerships, and customer support.',
  path: '/contact',
  keywords: ['contact Kedos', 'baby store support', 'customer service'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
