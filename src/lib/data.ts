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

export const CATEGORIES = ['All', 'Clothing', 'Toys', 'Nursery', 'Gear', 'Bedding', 'Bath'];

export const ORDERS: Order[] = [];

export const CUSTOMERS: Customer[] = [];
