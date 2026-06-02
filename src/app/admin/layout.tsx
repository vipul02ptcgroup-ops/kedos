import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Dashboard',
  description: 'Kedos admin area.',
  path: '/admin',
  noIndex: true,
  keywords: ['admin dashboard', 'store admin'],
});

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
