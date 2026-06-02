import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Subscribers',
  description: 'Manage Kedos newsletter subscribers and audience growth.',
  path: '/admin/subscribers',
  noIndex: true,
  keywords: ['newsletter subscribers', 'email audience'],
});

export default function AdminSubscribersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
