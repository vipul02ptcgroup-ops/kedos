import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'About',
  description: 'Learn about Kedos, our story, safety-first standards, and parent-focused baby product curation.',
  path: '/about',
  keywords: ['about Kedos', 'baby brand story', 'safe baby products'],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
