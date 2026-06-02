import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Reviews',
  description: 'Review and moderate Kedos customer reviews.',
  path: '/admin/reviews',
  noIndex: true,
  keywords: ['review moderation', 'customer reviews'],
});

export default function AdminReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
