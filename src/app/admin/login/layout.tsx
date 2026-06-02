import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Login',
  description: 'Sign in to the Kedos admin console.',
  path: '/admin/login',
  noIndex: true,
  keywords: ['admin login', 'Kedos admin'],
});

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
