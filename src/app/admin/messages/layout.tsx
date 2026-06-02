import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Messages',
  description: 'Review and manage Kedos customer contact messages.',
  path: '/admin/messages',
  noIndex: true,
  keywords: ['customer messages', 'support inbox'],
});

export default function AdminMessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
