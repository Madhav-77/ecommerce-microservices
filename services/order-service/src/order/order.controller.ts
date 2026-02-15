import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { OrderService } from './order.service';
import type {
  Order,
  OrderList,
  CreateOrderRequest,
  FindOrderByIdRequest,
  FindOrdersByUserIdRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  OrderServiceController,
  PlaceOrderRequest,
  WatchOrderStatusRequest,
  OrderStatusUpdate,
} from './interfaces/order-service.interface';

@Controller()
export class OrderController implements OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'PlaceOrder')
  async placeOrder(data: PlaceOrderRequest): Promise<Order> {
    return this.orderService.placeOrder(data);
  }

  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.orderService.createOrder(data);
  }

  @GrpcMethod('OrderService', 'FindOrderById')
  async findOrderById(data: FindOrderByIdRequest): Promise<Order> {
    return this.orderService.findOrderById(data);
  }

  @GrpcMethod('OrderService', 'FindOrdersByUserId')
  async findOrdersByUserId(
    data: FindOrdersByUserIdRequest,
  ): Promise<OrderList> {
    return this.orderService.findOrdersByUserId(data);
  }

  @GrpcMethod('OrderService', 'UpdateOrderStatus')
  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<Order> {
    return this.orderService.updateOrderStatus(data);
  }

  @GrpcMethod('OrderService', 'CancelOrder')
  async cancelOrder(data: CancelOrderRequest): Promise<Order> {
    return this.orderService.cancelOrder(data);
  }

  @GrpcMethod('OrderService', 'WatchOrderStatus')
  watchOrderStatus(
    data: WatchOrderStatusRequest,
  ): Observable<OrderStatusUpdate> {
    return this.orderService.watchOrderStatus(data);
  }
}
