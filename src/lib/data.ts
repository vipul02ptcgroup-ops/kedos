export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  features?: string[];
  ageRange?: string;
  inStock: boolean;
};

export type CartItem = Product & { quantity: number };

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: 'active' | 'inactive';
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Cotton Onesie Set',
    price: 24.99,
    originalPrice: 34.99,
    category: 'Clothing',
    image: 'https://plus.unsplash.com/premium_photo-1726768937392-786669364bd5?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.8,
    reviews: 124,
    badge: 'Best Seller',
    description: 'Soft, breathable organic cotton onesies perfect for your newborn. Pack of 5 in assorted pastel colors. GOTS certified organic, hypoallergenic, and gentle on delicate skin.',
    features: ['GOTS Certified Organic', 'Pack of 5', 'Snap closures', 'Machine washable', 'Sizes NB–12M'],
    ageRange: '0–12 months',
    inStock: true,
  },
  {
    id: '2',
    name: 'Woodland Friends Mobile',
    price: 44.99,
    category: 'Nursery',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    reviews: 89,
    badge: 'New',
    description: 'Hand-crafted wooden mobile with adorable woodland animal characters. Gentle music and slow rotation soothes babies to sleep.',
    features: ['Hand-crafted wood', 'Music box included', 'BPA-free paint', 'Easy crib attachment'],
    ageRange: '0–18 months',
    inStock: true,
  },
  {
    id: '3',
    name: 'Ergonomic Baby Carrier',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Gear',
    image: 'https://images.unsplash.com/photo-1770569248361-11ce53eb2ea5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.7,
    reviews: 203,
    badge: 'Sale',
    description: 'Award-winning ergonomic baby carrier designed for comfort. Supports hip development and keeps baby in the optimal M-position.',
    features: ['Hip-healthy design', 'Multiple carry positions', 'Adjustable fit', 'Machine washable'],
    ageRange: '3–36 months',
    inStock: true,
  },
  {
    id: '4',
    name: 'Soft Sensory Play Mat',
    price: 59.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1707353485825-69671262a2b0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.6,
    reviews: 156,
    description: 'Colorful, padded play mat with detachable toys to stimulate senses and encourage development.',
    features: ['Non-toxic materials', 'Waterproof backing', 'Easy to clean', '6 detachable toys'],
    ageRange: '0–24 months',
    inStock: true,
  },
  {
    id: '5',
    name: 'Bamboo Swaddle Blankets (3-Pack)',
    price: 39.99,
    category: 'Bedding',
    image: 'https://images.unsplash.com/photo-1601628570754-f602c5930dd5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.9,
    reviews: 312,
    badge: 'Best Seller',
    description: 'Ultra-soft bamboo muslin swaddle blankets. Temperature-regulating and breathable for year-round comfort.',
    features: ['70% bamboo, 30% cotton', 'Pack of 3', '47" x 47"', 'Gets softer with washing'],
    ageRange: '0–12 months',
    inStock: true,
  },
  {
    id: '6',
    name: 'Wooden Stacking Rings',
    price: 19.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1617387247352-9a9ed2d7de81?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.5,
    reviews: 78,
    description: 'Classic wooden stacking toy in beautiful natural colors. Helps develop fine motor skills and color recognition.',
    features: ['Natural wood', 'Non-toxic paint', 'FSC certified', '6 rings + base'],
    ageRange: '6–36 months',
    inStock: false,
  },
  {
    id: '7',
    name: 'Hooded Towel & Washcloth Set',
    price: 29.99,
    category: 'Bath',
    image: 'https://images.unsplash.com/photo-1763089359160-3c55707c5808?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.8,
    reviews: 167,
    description: 'Adorable hooded towels and matching washcloths made from ultra-absorbent bamboo terry.',
    features: ['Bamboo terry', '3 washcloths included', 'Hooded design', 'Hypoallergenic'],
    ageRange: '0–3 years',
    inStock: true,
  },
  {
    id: '8',
    name: 'Sound Machine & Night Light',
    price: 49.99,
    category: 'Nursery',
    image: 'https://images.unsplash.com/photo-1626088098529-9498f804476c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.7,
    reviews: 234,
    badge: 'New',
    description: '2-in-1 sound machine and color-changing night light. 20 soothing sounds and timer function.',
    features: ['20 sound options', 'Color-changing light', 'Timer & memory function', 'USB powered'],
    ageRange: 'All ages',
    inStock: true,
  },
];

export const CATEGORIES = ['All', 'Clothing', 'Toys', 'Nursery', 'Gear', 'Bedding', 'Bath'];

export const ORDERS: Order[] = [
];

export const CUSTOMERS: Customer[] = [
];
