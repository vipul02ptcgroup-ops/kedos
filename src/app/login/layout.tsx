import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Login',
  description: 'Sign in to your Kedos account.',
  path: '/login',
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
