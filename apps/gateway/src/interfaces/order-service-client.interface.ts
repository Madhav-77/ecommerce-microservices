// Order Service gRPC client interface
import { Observable } from 'rxjs';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderList {
  orders: Order[];
  total: number;
}

export interface PlaceOrderRequest {
  user_email: string;
  items: PlaceOrderItemRequest[];
}

export interface PlaceOrderItemRequest {
  product_id: string;
  quantity: number;
}

export interface FindOrderByIdRequest {
  id: string;
}

export interface FindOrdersByUserIdRequest {
  user_id: string;
  page: number;
  limit: number;
}

export interface WatchOrderStatusRequest {
  order_id: string;
}

export interface OrderStatusUpdate {
  order_id: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface OrderServiceClient {
  placeOrder(data: PlaceOrderRequest): any;
  findOrderById(data: FindOrderByIdRequest): any;
  findOrdersByUserId(data: FindOrdersByUserIdRequest): any;
  watchOrderStatus(data: WatchOrderStatusRequest): Observable<OrderStatusUpdate>;
}
