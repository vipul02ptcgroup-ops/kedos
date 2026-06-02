import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/seo/JsonLd';
import ScrollToTopOnRouteChange from '@/components/layout/ScrollToTopOnRouteChange';
import { DEFAULT_DESCRIPTION, organizationSchema, websiteSchema } from '@/lib/seo';

const fontDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const fontBody = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kedos.in'),
  applicationName: 'Kedos',
  keywords: [
    'baby products',
    'baby store india',
    'newborn essentials',
    'baby clothing',
    'baby toys',
    'nursery essentials',
    'Kedos',
  ],
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
    images: [
      {
        url: '/Images/Logo.png',
        alt: 'Kedos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kedos - Premium Baby Products',
    description: DEFAULT_DESCRIPTION,
    images: ['/Images/Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body>
        <ScrollToTopOnRouteChange />
        <JsonLd data={[websiteSchema(), organizationSchema()]} />
        {children}
      </body>
    </html>
  );
}
