// TypeScript interfaces matching order.proto messages
import { Observable } from 'rxjs';

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
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

export interface OrderList {
  orders: Order[];
  total: number;
}

export interface CreateOrderRequest {
  user_id: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  product_id: string;
  quantity: number;
  price: number; // Price at time of order (fetched by Gateway)
}

export interface FindOrderByIdRequest {
  id: string;
}

export interface FindOrdersByUserIdRequest {
  user_id: string;
  page: number;
  limit: number;
}

export interface UpdateOrderStatusRequest {
  id: string;
  status: OrderStatus;
}

export interface CancelOrderRequest {
  id: string;
}

// PlaceOrder - High-level orchestration request (no prices)
export interface PlaceOrderRequest {
  user_email: string;
  items: PlaceOrderItemRequest[];
}

export interface PlaceOrderItemRequest {
  product_id: string;
  quantity: number;
}

// Server Streaming - Watch Order Status
export interface WatchOrderStatusRequest {
  order_id: string;
}

export interface OrderStatusUpdate {
  order_id: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
}

// Bidirectional Streaming - Interactive Order Tracking
export enum QueryType {
  SUBSCRIBE = 'SUBSCRIBE',
  GET_LOCATION = 'GET_LOCATION',
  GET_ETA = 'GET_ETA',
  GET_STATUS = 'GET_STATUS',
  CANCEL_ORDER = 'CANCEL_ORDER',
}

export interface TrackingQuery {
  order_id: string;
  type: QueryType;
  message?: string;
}

export enum ResponseType {
  STATUS_UPDATE = 'STATUS_UPDATE',
  LOCATION = 'LOCATION',
  ETA = 'ETA',
  CONFIRMATION = 'CONFIRMATION',
  ERROR = 'ERROR',
}

export interface TrackingResponse {
  order_id: string;
  type: ResponseType;
  status: OrderStatus;
  message: string;
  location?: string;
  eta?: string;
  timestamp: string;
}

// Service interface for gRPC controller
export interface OrderServiceController {
  placeOrder(data: PlaceOrderRequest): Promise<Order>;
  createOrder(data: CreateOrderRequest): Promise<Order>;
  findOrderById(data: FindOrderByIdRequest): Promise<Order>;
  findOrdersByUserId(data: FindOrdersByUserIdRequest): Promise<OrderList>;
  updateOrderStatus(data: UpdateOrderStatusRequest): Promise<Order>;
  cancelOrder(data: CancelOrderRequest): Promise<Order>;
  watchOrderStatus(data: WatchOrderStatusRequest): Observable<OrderStatusUpdate>;
  interactiveOrderTracking(queries: Observable<TrackingQuery>): Observable<TrackingResponse>;
}
