import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Create Account',
  description: 'Create your Kedos account.',
  path: '/register',
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
