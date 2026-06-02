'use client';

import { useEffect } from 'react';
import { Product } from '@/lib/data';
import { getProductSlug } from '@/lib/slug';

const SITE_URL = 'https://kedos.in';

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

export default function ProductSeo({ product }: { product: Product }) {
  useEffect(() => {
    const url = `${SITE_URL}/products/${getProductSlug(product)}`;
    const title = `${product.name} | Kedos`;
    const description =
      product.description || `Shop ${product.name} from Kedos, curated baby products for safety, comfort, and joy.`;
    const image = product.images?.[0] || product.image;

    document.title = title;
    upsertCanonical(url);
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'product' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Kedos' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    if (image) upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
  }, [product]);

  return null;
}
