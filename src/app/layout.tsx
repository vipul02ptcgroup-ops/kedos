import type { Metadata } from 'next';
import './globals.css';
import JsonLd from '@/components/seo/JsonLd';
import ScrollToTopOnRouteChange from '@/components/layout/ScrollToTopOnRouteChange';
import { DEFAULT_DESCRIPTION, organizationSchema, websiteSchema } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://kedos.in'),
  applicationName: 'Kedos',
  icons: {
    icon: '/Images/Favicon.png',
  },
  title: {
    default: 'Kedos - Premium Baby Products',
    template: '%s | Kedos',
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://kedos.in',
    siteName: 'Kedos',
    title: 'Kedos - Premium Baby Products',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: 'Kedos - Premium Baby Products',
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ScrollToTopOnRouteChange />
        <JsonLd data={[websiteSchema(), organizationSchema()]} />
        {children}
      </body>
    </html>
  );
}
