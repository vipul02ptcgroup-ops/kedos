import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Customers',
  description: 'Manage Kedos customers, roles, and account controls.',
  path: '/admin/customers',
  noIndex: true,
  keywords: ['customer management', 'admin customers'],
});

export default function AdminCustomersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
