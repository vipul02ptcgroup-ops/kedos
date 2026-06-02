import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Settings',
  description: 'Update Kedos store settings, shipping, notifications, and payments.',
  path: '/admin/settings',
  noIndex: true,
  keywords: ['store settings', 'admin settings'],
});

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
