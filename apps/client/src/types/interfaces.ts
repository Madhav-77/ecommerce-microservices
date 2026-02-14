// Shared type definitions for the e-commerce client application

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export interface OrderList {
  orders: Order[];
  total: number;
}

export interface ProductList {
  products: Product[];
  total: number;
}
