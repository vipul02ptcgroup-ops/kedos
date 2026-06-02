import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Admin Size Guide',
  description: 'Manage Kedos size guide content and measurement charts.',
  path: '/admin/size-guide',
  noIndex: true,
  keywords: ['size guide admin', 'measurement charts'],
});

export default function AdminSizeGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
