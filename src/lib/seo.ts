import type { Metadata } from 'next';
import { Product } from '@/lib/data';
import { getProductSlug } from '@/lib/slug';

export const SITE_NAME = 'Kedos';
export const SITE_URL = 'https://kedos.in';
export const DEFAULT_DESCRIPTION =
  'Lovingly curated baby products designed for safety, comfort, and joy.';
export const DEFAULT_OG_IMAGE = '/Images/Logo.png';

type SeoConfig = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  twitterCard?: 'summary' | 'summary_large_image';
};

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords,
  twitterCard = 'summary_large_image',
}: SeoConfig): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/Images/Logo.png'),
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: 'Kedos Baby Products',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  q: string;
  a: string;
};

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function productSchema(product: Product) {
  const url = absoluteUrl(`/products/${getProductSlug(product)}`);
  const description =
    product.description ||
    `Shop ${product.name} from Kedos, curated baby products for safety, comfort, and joy.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: product.images?.length ? product.images : [product.image].filter(Boolean),
    sku: product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    aggregateRating: product.reviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating || 0,
          reviewCount: product.reviews,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

type ArticleSchemaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
};

export function articleSchema({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  datePublished,
  dateModified,
}: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    image: [absoluteUrl(image)],
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Images/Logo.png'),
      },
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}
