import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'About Kedos',
  description: 'Learn about Kedos, our story, safety-first standards, and parent-focused baby product curation.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
