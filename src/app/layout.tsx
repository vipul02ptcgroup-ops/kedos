import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: {
    icon: "/Images/Favicon.png",
  },
  title: 'Kedos – Premium Baby Products',
  description: 'Lovingly curated baby products for your little one\'s every milestone.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}