import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  OrderType,
  OrderListType,
  PlaceOrderInput,
} from '../types/order.type';
import type { UserServiceClient } from '../interfaces/user-service-client.interface';
import type { User } from '../interfaces/user-service-client.interface';
import type { OrderServiceClient } from '../interfaces/order-service-client.interface';
import type { Order } from '../interfaces/order-service-client.interface';

@Resolver(() => OrderType)
export class OrderResolver implements OnModuleInit {
  private readonly logger = new Logger(OrderResolver.name);
  private userService: UserServiceClient;
  private orderService: OrderServiceClient;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('ORDER_SERVICE') private orderClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
    this.orderService = this.orderClient.getService<OrderServiceClient>('OrderService');
  }

  @Mutation(() => OrderType, { description: 'Place a new order (orchestration handled by Order Service)' })
  async placeOrder(@Args('input') input: PlaceOrderInput): Promise<OrderType> {
    this.logger.log(`Placing order for user: ${input.user_email}`);

    try {
      // Gateway acts as thin translation layer
      // Order Service handles all orchestration (User, Product, Order coordination)
      const order = await lastValueFrom<Order>(
        this.orderService.placeOrder({
          user_email: input.user_email,
          items: input.items,
        }),
      );

      this.logger.log(`Order placed successfully: ${order.id}`);
      return order as OrderType;
    } catch (error) {
      this.logger.error('Order placement failed:', error.message);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  @Query(() => OrderListType, { description: 'Get orders for a user' })
  async getUserOrders(
    @Args('user_email') userEmail: string,
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
  ): Promise<OrderListType> {
    try {
      // First get user by email
      const user = await lastValueFrom<User>(
        this.userService.findUserByEmail({ email: userEmail }),
      );

      if (!user) {
        throw new Error(`User with email ${userEmail} not found`);
      }

      // Then get their orders
      const result = await lastValueFrom(
        this.orderService.findOrdersByUserId({
          user_id: user.id,
          page,
          limit,
        }),
      );

      return result as OrderListType;
    } catch (error) {
      throw new Error(`Failed to get user orders: ${error.message}`);
    }
  }

  @Query(() => OrderType, { description: 'Get order by ID', nullable: true })
  async getOrder(@Args('id') id: string): Promise<OrderType | null> {
    try {
      const order = await lastValueFrom(
        this.orderService.findOrderById({ id }),
      );
      return order as OrderType;
    } catch (error) {
      if (error.code === 5) {
        // NOT_FOUND
        return null;
      }
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }
}
