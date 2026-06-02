import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Activity Log',
  description: 'Review recent Kedos admin activity and audit entries.',
  path: '/admin/admin-log',
  noIndex: true,
  keywords: ['admin log', 'audit log'],
});

export default function AdminLogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
