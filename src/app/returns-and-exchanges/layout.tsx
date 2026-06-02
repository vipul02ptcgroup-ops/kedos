import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Returns and Exchanges',
  description: 'Read Kedos returns and exchanges policy, eligibility, return timelines, and exchange process.',
  path: '/returns-and-exchanges',
  keywords: ['returns policy', 'exchange policy', 'refunds'],
});

export default function ReturnsAndExchangesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
