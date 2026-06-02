import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Categories',
  description: 'Manage Kedos product categories and catalog organization.',
  path: '/admin/categories',
  noIndex: true,
  keywords: ['product categories', 'catalog management'],
});

export default function AdminCategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
