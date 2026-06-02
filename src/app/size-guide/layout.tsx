import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Size Guide',
  description: 'Use Kedos size guide for baby clothing and footwear to choose the best fit.',
  path: '/size-guide',
  keywords: ['size guide', 'baby size chart', 'baby clothing sizes'],
});

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
