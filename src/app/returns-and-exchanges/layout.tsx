import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Returns and Exchanges - Kedos',
  description: 'Read Kedos returns and exchanges policy, eligibility, return timelines, and exchange process.',
  path: '/returns-and-exchanges',
});

export default function ReturnsAndExchangesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

