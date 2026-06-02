import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'FAQ',
  description: 'Find quick answers about shipping, returns, safety, payment options, and order tracking at Kedos.',
  path: '/faq',
  keywords: ['Kedos FAQ', 'baby store FAQ', 'shipping questions'],
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
