import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'My Account',
  description: 'View your Kedos profile, orders, messages, addresses, and settings.',
  path: '/profile',
  noIndex: true,
  keywords: ['my account', 'customer profile', 'order history'],
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
