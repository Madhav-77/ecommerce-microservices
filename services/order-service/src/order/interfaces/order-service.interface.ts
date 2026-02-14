// TypeScript interfaces matching order.proto messages

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
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

// Service interface for gRPC controller
export interface OrderServiceController {
  placeOrder(data: PlaceOrderRequest): Promise<Order>;
  createOrder(data: CreateOrderRequest): Promise<Order>;
  findOrderById(data: FindOrderByIdRequest): Promise<Order>;
  findOrdersByUserId(data: FindOrdersByUserIdRequest): Promise<OrderList>;
  updateOrderStatus(data: UpdateOrderStatusRequest): Promise<Order>;
  cancelOrder(data: CancelOrderRequest): Promise<Order>;
}
