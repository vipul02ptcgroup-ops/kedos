import type { Metadata } from 'next';
import { findProductForSeo } from '@/lib/products.server';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, createMetadata } from '@/lib/seo';
import { getProductSlug } from '@/lib/slug';

type ProductLayoutProps = {
  children: React.ReactNode;
  params: { id: string };
};

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const routeKey = String(params?.id || '').trim();
  const product = await findProductForSeo(routeKey);

  if (!product) {
    return createMetadata({
      title: 'Product Not Found',
      description: 'The requested Kedos product could not be found.',
      path: routeKey ? `/products/${routeKey}` : '/products',
      noIndex: true,
      keywords: ['product not found', 'Kedos'],
    });
  }

  const canonicalPath = `/products/${getProductSlug(product)}`;
  const description =
    product.description?.trim() ||
    `Shop ${product.name} from Kedos for safe, comfortable, and thoughtfully curated baby essentials.`;
  const image = product.images?.[0] || product.image || DEFAULT_OG_IMAGE;
  const title = product.name;

  const metadata = createMetadata({
    title,
    description,
    path: canonicalPath,
    image,
    keywords: [
      product.name,
      product.category,
      `${product.category} baby products`,
      'buy baby products online',
      'Kedos',
    ],
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      url: `${SITE_URL}${canonicalPath}`,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
          alt: `${product.name} product image`,
        },
      ],
    },
    twitter: {
      ...metadata.twitter,
      title,
      description,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
  };
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
