import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Contact Kedos',
  description: 'Contact Kedos for order enquiries, product information, returns, partnerships, and customer support.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
