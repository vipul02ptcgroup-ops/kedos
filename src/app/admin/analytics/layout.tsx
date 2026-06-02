import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Analytics',
  description: 'Monitor Kedos revenue, traffic, and conversion analytics.',
  path: '/admin/analytics',
  noIndex: true,
  keywords: ['admin analytics', 'sales analytics'],
});

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
