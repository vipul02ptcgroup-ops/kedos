'use client';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, Star, Upload, X, FileJson } from 'lucide-react';
import { Product } from '@/lib/data';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { removeProduct, saveProduct, subscribeProducts } from '@/lib/products';
import { subscribeCategories } from '@/lib/categories';
import { getProductSlug } from '@/lib/slug';
import { createAdminLog, getAdminActorSnapshot } from '@/lib/adminLogs';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  originalPrice: undefined,
  category: '',
  image: '',
  images: [],
  rating: 0,
  reviews: 0,
  badge: '',
  description: '',
  inStock: true,
  features: [],
  ageRange: '',
  newArrival: false,
};

function normalizeImageUrl(value: string) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) return raw;
  if (raw.startsWith('gs://')) return raw;
  if (raw.includes('.')) return `https://${raw}`;
  return raw;
}

type ImportStatus = {
  tone: 'success' | 'error' | 'warning';
  message: string;
  details?: string[];
};

type ProductImportCandidate = Omit<Product, 'id'>;
type ImportSummary = {
  totalProductsFound: number;
  successfullyAdded: number;
  skippedDuplicates: number;
  failedProducts: number;
  imageUploadFailures: number;
};

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

function normalizeProductName(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function validateImportedProduct(input: unknown): { product?: ProductImportCandidate; errors: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { errors: ['Entry must be a product object.'] };
  }

  const record = input as Record<string, unknown>;
  const name = String(record.name || '').trim();
  const category = String(record.category || '').trim();
  const description = String(record.description || '').trim();
  const price = Number(record.price);
  const rating = Number(record.rating);
  const reviews = Number(record.reviews);
  const inStock = record.inStock;

  const errors: string[] = [];

  if (!name) errors.push('name is required');
  if (!Number.isFinite(price) || price < 0) errors.push('price must be a valid non-negative number');
  if (!category) errors.push('category is required');
  if (!description) errors.push('description is required');
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) errors.push('rating must be between 0 and 5');
  if (!Number.isFinite(reviews) || reviews < 0) errors.push('reviews must be a valid non-negative number');
  if (typeof inStock !== 'boolean') errors.push('inStock must be true or false');

  const originalPriceRaw = record.originalPrice;
  const originalPrice =
    originalPriceRaw === undefined || originalPriceRaw === null || String(originalPriceRaw).trim() === ''
      ? undefined
      : Number(originalPriceRaw);
  if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
    errors.push('originalPrice must be a valid non-negative number when provided');
  }

  const featuresRaw = record.features;
  const features = Array.isArray(featuresRaw)
    ? featuresRaw.map((item) => String(item).trim()).filter(Boolean)
    : featuresRaw === undefined
      ? []
      : null;
  if (featuresRaw !== undefined && !Array.isArray(featuresRaw)) {
    errors.push('features must be an array of strings when provided');
  }

  const imagesRaw = record.images;
  const mainImage = normalizeImageUrl(String(record.image || '').trim());
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.map((item) => normalizeImageUrl(String(item).trim())).filter(Boolean)
    : imagesRaw === undefined
      ? []
      : null;
  if (imagesRaw !== undefined && !Array.isArray(imagesRaw)) {
    errors.push('images must be an array of strings when provided');
  }
  const normalizedImages = [mainImage, ...(images || [])].filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index);
  if (!normalizedImages.length) errors.push('image or images is required');

  if (record.badge !== undefined && typeof record.badge !== 'string') {
    errors.push('badge must be a string when provided');
  }

  if (record.ageRange !== undefined && typeof record.ageRange !== 'string') {
    errors.push('ageRange must be a string when provided');
  }

  if (record.newArrival !== undefined && typeof record.newArrival !== 'boolean') {
    errors.push('newArrival must be true or false when provided');
  }

  if (errors.length) return { errors };

  return {
    errors: [],
    product: {
      name,
      price,
      originalPrice,
      category,
      image: normalizedImages[0],
      images: normalizedImages,
      rating,
      reviews,
      badge: record.badge ? String(record.badge).trim() : undefined,
      description,
      features: features || [],
      ageRange: record.ageRange ? String(record.ageRange).trim() : undefined,
      inStock: Boolean(inStock),
      newArrival: typeof record.newArrival === 'boolean' ? record.newArrival : false,
    },
  };
}

function summarizeImportNames(names: string[]) {
  if (!names.length) return '';
  const preview = names.slice(0, 3).join(', ');
  const remaining = names.length - 3;
  return remaining > 0 ? `${preview} +${remaining} more` : preview;
}

function getImageExtension(value: string) {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return '';

  try {
    const url = new URL(normalized, 'https://dummy.local');
    const cleanPath = url.pathname.toLowerCase();
    if (!cleanPath.includes('.')) return '';
    return cleanPath.split('.').pop() || '';
  } catch {
    return '';
  }
}

function isSupportedImageValue(value: string) {
  const normalized = normalizeImageUrl(value);
  if (!normalized) return false;
  const extension = getImageExtension(normalized);
  return !extension || ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

function isFirebaseHostedImage(value: string) {
  const normalized = normalizeImageUrl(value).toLowerCase();
  return (
    normalized.startsWith('gs://') ||
    normalized.includes('firebasestorage.googleapis.com/') ||
    normalized.includes('.firebasestorage.app/') ||
    normalized.includes('storage.googleapis.com/')
  );
}

async function uploadImageFromUrl(imageUrl: string) {
  const response = await fetch('/api/admin/upload-product-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok || !data?.ok || !data?.data?.url) {
    throw new Error(data?.error || `Image upload failed (HTTP ${response.status}).`);
  }

  return data.data.url as string;
}

async function resolveImportedImageUrl(imageUrl: string) {
  const normalized = normalizeImageUrl(imageUrl);
  if (!normalized) throw new Error('Image URL is empty.');
  if (!isSupportedImageValue(normalized)) {
    throw new Error('Unsupported image format. Only JPG, JPEG, PNG, and WEBP are allowed.');
  }
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('gs://') ||
    isFirebaseHostedImage(normalized) ||
    !/^https?:\/\//i.test(normalized)
  ) {
    return normalized;
  }
  return uploadImageFromUrl(normalized);
}

async function resolveImportedProductImages(product: ProductImportCandidate) {
  const sourceImages = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  const imageFailures: string[] = [];
  const resolvedImages: string[] = [];

  for (const imageUrl of sourceImages) {
    try {
      const resolved = await resolveImportedImageUrl(imageUrl);
      resolvedImages.push(resolved);
    } catch (error: any) {
      const message = error?.message || 'Image processing failed.';
      imageFailures.push(`${product.name}: ${imageUrl} - ${message}`);
    }
  }

  if (!resolvedImages.length) {
    throw new Error('No valid images remained after image processing.');
  }

  return {
    product: {
      ...product,
      image: resolvedImages[0],
      images: resolvedImages,
    },
    imageFailures,
  };
}

function buildImportSummaryLines(summary: ImportSummary) {
  return [
    `Total products found: ${summary.totalProductsFound}`,
    `Successfully added: ${summary.successfullyAdded}`,
    `Skipped duplicates: ${summary.skippedDuplicates}`,
    `Failed products: ${summary.failedProducts}`,
    `Image upload failures: ${summary.imageUploadFailures}`,
  ];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [jsonImporting, setJsonImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = subscribeProducts((rows) => {
      setProducts(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeCategories(setCategories);
    return () => unsub();
  }, []);

  const categoriesForForm = useMemo(() => {
    const set = new Set(categories);
    for (const p of products) set.add(p.category);
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  const filterCategories = useMemo(() => ['All', ...categoriesForForm], [categoriesForForm]);

  const filtered = useMemo(() => {
    return products
      .filter(p => cat === 'All' || p.category === cat)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, cat, search]);

  const openForAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyProduct, category: categoriesForForm[0] || 'General' });
    setShowModal(true);
  };

  const openForEdit = (product: Product) => {
    setEditProduct(product);
    const normalizedImage = normalizeImageUrl(product.image || '');
    const normalizedImages = (product.images?.length ? product.images : product.image ? [product.image] : [])
      .map((img) => normalizeImageUrl(img))
      .filter(Boolean);
    setForm({
      ...product,
      image: normalizedImage || normalizedImages[0] || '',
      images: normalizedImages,
    });
    setShowModal(true);
  };

  const onSave = async () => {
    const images = (form.images || []).filter(Boolean);
    const features = (form.features || [])
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
    const isEdit = Boolean(editProduct?.id);
    await saveProduct({
      ...form,
      image: images[0] || form.image,
      images,
      features,
      rating: Number.isFinite(form.rating) ? form.rating : 0,
      reviews: Number.isFinite(form.reviews) ? form.reviews : 0,
      id: editProduct?.id,
    });
    const actor = getAdminActorSnapshot();
    await createAdminLog({
      action: isEdit ? 'product_updated' : 'product_created',
      ...actor,
      targetUid: editProduct?.id || '',
      targetEmail: '',
      details: `${form.name} (${form.category})`,
    });
    setShowModal(false);
  };

  const onImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const body = new FormData();
          body.append('file', file);
          const response = await fetch('/api/admin/upload-product-image', {
            method: 'POST',
            body,
          });
          const raw = await response.text();
          let data: any = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch {
            data = null;
          }
          if (!response.ok || !data?.ok || !data?.data?.url) {
            throw new Error(data?.error || `Image upload failed (HTTP ${response.status}).`);
          }
          return data.data.url as string;
        })
      );
      setForm((prev) => {
        const images = [...(prev.images || []), ...uploaded].map((img) => normalizeImageUrl(img)).filter(Boolean);
        return { ...prev, image: images[0] || prev.image, images };
      });
    } catch (error: any) {
      const code = error?.code ? ` (${error.code})` : '';
      const message = error?.message || 'Image upload failed.';
      setUploadError(`${message}${code}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageUrl: string) => {
    setForm((prev) => {
      const images = (prev.images || []).filter((img) => img !== imageUrl);
      return { ...prev, images, image: images[0] || '' };
    });
  };

  const setPrimaryImage = (imageUrl: string) => {
    setForm((prev) => {
      const images = [imageUrl, ...(prev.images || []).filter((img) => img !== imageUrl)];
      return { ...prev, image: imageUrl, images };
    });
  };

  const onDelete = async (id: string) => {
    const target = products.find((p) => p.id === id);
    await removeProduct(id);
    const actor = getAdminActorSnapshot();
    await createAdminLog({
      action: 'product_deleted',
      ...actor,
      targetUid: id,
      targetEmail: '',
      details: target?.name || id,
    });
  };

  const openJsonPicker = () => {
    if (jsonImporting) return;
    setImportStatus(null);
    jsonInputRef.current?.click();
  };

  const onJsonUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setJsonImporting(true);
    setImportStatus(null);

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      const summary: ImportSummary = {
        totalProductsFound: entries.length,
        successfullyAdded: 0,
        skippedDuplicates: 0,
        failedProducts: 0,
        imageUploadFailures: 0,
      };

      if (!entries.length) {
        setImportStatus({ tone: 'error', message: 'The uploaded JSON file is empty.' });
        return;
      }

      const validProducts: ProductImportCandidate[] = [];
      const failedProducts: string[] = [];
      const imageFailures: string[] = [];

      entries.forEach((entry, index) => {
        const { product, errors } = validateImportedProduct(entry);
        if (!product) {
          failedProducts.push(`Item ${index + 1}: ${errors.join(', ')}`);
          return;
        }
        validProducts.push(product);
      });
      summary.failedProducts = failedProducts.length;

      const existingNames = new Set(products.map((product) => normalizeProductName(product.name)));
      const acceptedNames = new Set<string>();
      const duplicateProducts: ProductImportCandidate[] = [];
      const importQueue: ProductImportCandidate[] = [];

      validProducts.forEach((product) => {
        const normalizedName = normalizeProductName(product.name);
        const isDuplicate = existingNames.has(normalizedName) || acceptedNames.has(normalizedName);

        if (isDuplicate) {
          duplicateProducts.push(product);
          return;
        }

        acceptedNames.add(normalizedName);
        importQueue.push(product);
      });

      const duplicateNames = duplicateProducts.map((product) => product.name);
      let skippedDuplicates = duplicateNames.length;

      if (duplicateProducts.length) {
        const duplicateLabel = summarizeImportNames(duplicateNames);
        const shouldImportDuplicates = window.confirm(
          `Duplicate product name(s) found: ${duplicateLabel}. Click OK to import them anyway, or Cancel to skip duplicates.`
        );

        if (shouldImportDuplicates) {
          importQueue.push(...duplicateProducts);
          skippedDuplicates = 0;
        }
      }
      summary.skippedDuplicates = skippedDuplicates;

      if (!importQueue.length) {
        setImportStatus({
          tone: failedProducts.length || skippedDuplicates ? 'warning' : 'error',
          message: ['No products were imported.', ...buildImportSummaryLines(summary)].join('\n'),
          details: failedProducts.slice(0, 8),
        });
        return;
      }

      const actor = getAdminActorSnapshot();
      for (const product of importQueue) {
        try {
          const resolved = await resolveImportedProductImages(product);
          if (resolved.imageFailures.length) {
            imageFailures.push(...resolved.imageFailures);
          }

          const createdId = await saveProduct(resolved.product);
          await createAdminLog({
            action: 'product_created',
            ...actor,
            targetUid: createdId,
            targetEmail: '',
            details: `${product.name} (${product.category}) via JSON upload`,
          });
          summary.successfullyAdded += 1;
        } catch (error: any) {
          summary.failedProducts += 1;
          failedProducts.push(`${product.name}: ${error?.message || 'Product import failed.'}`);
        }
      }
      summary.imageUploadFailures = imageFailures.length;

      const detailLines = [...failedProducts, ...imageFailures].slice(0, 10);
      const hasWarnings = summary.skippedDuplicates > 0 || summary.failedProducts > 0 || summary.imageUploadFailures > 0;
      setImportStatus({
        tone: hasWarnings ? 'warning' : 'success',
        message: [
          summary.successfullyAdded ? 'JSON import completed.' : 'JSON import finished with issues.',
          ...buildImportSummaryLines(summary),
        ].join('\n'),
        details: detailLines,
      });
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        setImportStatus({ tone: 'error', message: 'Invalid JSON file. Please upload a valid .json file.' });
      } else {
        setImportStatus({
          tone: 'error',
          message: error?.message || 'JSON import failed. Please try again.',
        });
      }
    } finally {
      setJsonImporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-slate-800">Products</h1>
            <p className="text-sm text-slate-500 font-body">{products.length} total products</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json,application/json"
              onChange={onJsonUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={openJsonPicker}
              disabled={jsonImporting}
              className="flex items-center gap-2 border border-slate-200 bg-white px-5 py-2.5 rounded-xl font-medium text-sm font-body text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileJson size={16} /> {jsonImporting ? 'Uploading JSON...' : 'Upload JSON'}
            </button>
            <button onClick={openForAdd}
              className="flex items-center gap-2 bg-blush-500 hover:bg-blush-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm font-body transition-colors">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {importStatus && (
          <div
            className={[
              'mb-5 rounded-2xl border px-4 py-3 text-sm font-body',
              importStatus.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : importStatus.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-700',
            ].join(' ')}
          >
            <div className="whitespace-pre-line">{importStatus.message}</div>
            {!!importStatus.details?.length && (
              <div className="mt-2 space-y-1">
                {importStatus.details.map((detail) => (
                  <div key={detail} className="whitespace-pre-line">
                    {detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-body" />
          </div>
          <div className="relative">
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-body text-slate-700">
              {filterCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!loading && filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={normalizeImageUrl(p.image) || '/Images/Logo.png'} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[180px]">{p.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{p.category}</span></td>
                    <td className="px-4 py-4">?{p.price}</td>
                    <td className="px-4 py-4">{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                    <td className="px-4 py-4"><div className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" />{p.rating}</div></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/products/${getProductSlug(p)}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500"><Eye size={15} /></Link>
                        <button onClick={() => openForEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500"><Edit2 size={15} /></button>
                        <button onClick={() => onDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">Showing {filtered.length} of {products.length} products</div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <h2 className="font-display text-xl text-slate-800">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-xs text-slate-500 font-body mt-0.5">Manage storefront details here</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500">X</button>
            </div>
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Info</h3>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                <input type="number" value={form.originalPrice || ''} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })} placeholder="Original Price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catalog Details</h3>
              <input
                value={form.badge || ''}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Badge (example: Bestseller)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
              />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200">
                {(categoriesForForm.length ? categoriesForForm : ['General']).map(c => <option key={c}>{c}</option>)}
              </select>
              <input value={form.ageRange || ''} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} placeholder="Age Range" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ratings & Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  placeholder="Rating (0 to 5)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
                <input
                  type="number"
                  min="0"
                  value={form.reviews}
                  onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })}
                  placeholder="Reviews count"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
              <textarea
                value={(form.features || []).join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    features: e.target.value
                      .split(',')
                      .map((line) => line.trim())
                      .filter(Boolean),
                  })
                }
                rows={3}
                placeholder="Features separated by comma (example: Soft cotton, Skin-safe, Breathable)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
              />
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Images</h3>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600 cursor-pointer hover:border-blush-300 hover:bg-blush-50/40">
                  <Upload size={18} className="text-slate-400" />
                  <span>{uploading ? 'Uploading images...' : 'Upload multiple product images'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => onImageUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
                {uploadError && <p className="text-sm text-red-500 font-body">{uploadError}</p>}
                <input
                  value={form.image}
                  onChange={(e) => {
                    const next = normalizeImageUrl(e.target.value);
                    setForm({
                      ...form,
                      image: next,
                      images: next ? [next, ...((form.images || []).filter((img) => img !== next))] : form.images,
                    });
                  }}
                  placeholder="Or paste main image URL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
                {!!form.images?.length && (
                  <div className="grid grid-cols-4 gap-3">
                    {form.images.map((img) => (
                      <div key={img} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <button type="button" onClick={() => setPrimaryImage(img)} className="w-full h-full">
                          <img src={normalizeImageUrl(img) || '/Images/Logo.png'} alt="" className="w-full h-full object-cover" />
                        </button>
                        {img === form.image && (
                          <span className="absolute left-1.5 bottom-1.5 rounded-md bg-blush-500 px-1.5 py-0.5 text-[10px] text-white">Main</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm hover:text-red-500"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 w-fit"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />In Stock</label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 w-fit">
                <input
                  type="checkbox"
                  checked={!!form.newArrival}
                  onChange={(e) => setForm({ ...form, newArrival: e.target.checked })}
                />
                Show in New Arrivals
              </label>
              <div className="sticky bottom-0 bg-white pt-2">
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                  <button onClick={onSave} className="px-5 py-2.5 bg-blush-500 hover:bg-blush-600 text-white rounded-xl">Save Product</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
