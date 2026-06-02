import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import ProductsPageClient from '@/components/pages/ProductsPageClient';
import { breadcrumbSchema, createMetadata } from '@/lib/seo';
import { toSlug } from '@/lib/slug';

type ProductsPageProps = {
  searchParams?: {
    category?: string | string[];
    search?: string | string[];
  };
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function generateMetadata({ searchParams }: ProductsPageProps): Metadata {
  const category = String(readParam(searchParams?.category) || '').trim();
  const search = String(readParam(searchParams?.search) || '').trim();
  const normalizedCategory = toSlug(category);

  if (search) {
    return createMetadata({
      title: `Search Results for "${search}"`,
      description: `Browse Kedos search results for ${search} across baby clothing, toys, nursery essentials, and more.`,
      path: '/products',
      noIndex: true,
      keywords: [search, 'product search', 'baby products'],
    });
  }

  if (normalizedCategory) {
    const label = normalizedCategory
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    return createMetadata({
      title: `${label} Baby Products`,
      description: `Shop ${label.toLowerCase()} and baby essentials from Kedos with curated options for safety, comfort, and joy.`,
      path: `/products?category=${normalizedCategory}`,
      keywords: [label, `${label} baby products`, 'baby products online', 'Kedos'],
    });
  }

  return createMetadata({
    title: 'Baby Products',
    description: 'Shop curated baby clothing, toys, nursery essentials, bedding, bath products, and baby gear at Kedos.',
    path: '/products',
    keywords: ['baby products', 'baby clothing', 'baby toys', 'nursery essentials'],
  });
}

export default function ProductsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
        ])}
      />
      <ProductsPageClient />
    </>
  );
}
