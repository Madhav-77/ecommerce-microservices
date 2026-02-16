import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable, interval } from 'rxjs';
import { map, take, concatMap, delay } from 'rxjs/operators';
import { Order as OrderEntity } from '../entities/order.entity';
import { OrderItem as OrderItemEntity } from '../entities/order-item.entity';
import type {
  Order,
  OrderList,
  CreateOrderRequest,
  FindOrderByIdRequest,
  FindOrdersByUserIdRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  PlaceOrderRequest,
  WatchOrderStatusRequest,
  OrderStatusUpdate,
  TrackingQuery,
  TrackingResponse,
} from './interfaces/order-service.interface';
import { OrderStatus, QueryType, ResponseType } from './interfaces/order-service.interface';
import type { UserServiceClient, User } from './interfaces/user-service-client.interface';
import type { ProductServiceClient, Product, CheckStockResponse } from './interfaces/product-service-client.interface';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);
  private userService: UserServiceClient;
  private productService: ProductServiceClient;

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('PRODUCT_SERVICE') private productClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
    this.productService = this.productClient.getService<ProductServiceClient>('ProductService');
  }

  /**
   * PlaceOrder - High-level orchestration method
   * Coordinates User, Product, and Order services to complete order placement
   */
  async placeOrder(data: PlaceOrderRequest): Promise<Order> {
    this.logger.log(`Orchestrating order placement for user: ${data.user_email}`);

    try {
      // STEP 1: Validate user exists
      this.logger.log('Step 1: Validating user...');
      const user = await lastValueFrom<User>(
        this.userService.findUserByEmail({ email: data.user_email }),
      );

      if (!user) {
        throw new RpcException({
          code: 5, // NOT_FOUND
          message: `User with email ${data.user_email} not found`,
        });
      }

      this.logger.log(`User validated: ${user.id}`);

      // STEP 2: Fetch product details and check stock (PARALLEL for performance)
      this.logger.log('Step 2: Fetching products and checking stock (parallel)...');

      const productChecks = data.items.map(async (item) => {
        const [product, stockCheck] = await Promise.all([
          lastValueFrom<Product>(
            this.productService.findProductById({ id: item.product_id }),
          ),
          lastValueFrom<CheckStockResponse>(
            this.productService.checkStock({
              id: item.product_id,
              required_quantity: item.quantity,
            }),
          ),
        ]);

        return {
          product,
          stockCheck,
          requestedQuantity: item.quantity,
        };
      });

      const productResults = await Promise.all(productChecks);

      // Validate all products exist and have sufficient stock
      for (const result of productResults) {
        if (!result.product) {
          throw new RpcException({
            code: 5, // NOT_FOUND
            message: `Product not found`,
          });
        }
        if (!result.stockCheck.available) {
          throw new RpcException({
            code: 9, // FAILED_PRECONDITION
            message:
              `Insufficient stock for product ${result.product.name}. ` +
              `Available: ${result.stockCheck.current_stock}, Requested: ${result.requestedQuantity}`,
          });
        }
      }

      this.logger.log('All products available with sufficient stock');

      // STEP 3: Calculate total amount
      // At this point, all products are validated to exist (non-null)
      const enrichedItems = productResults.map((result) => ({
        product_id: result.product!.id, // Non-null assertion safe after validation
        quantity: result.requestedQuantity,
        price: result.product!.price, // Current price from Product Service
      }));

      const totalAmount = enrichedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      this.logger.log(`Total amount calculated: ${totalAmount}`);

      // STEP 4: Reserve stock for each item (SEQUENTIAL to handle failures properly)
      this.logger.log('Step 4: Reserving stock (sequential with rollback on failure)...');
      const reservedItems: string[] = []; // Track successful reservations for rollback

      try {
        for (const item of enrichedItems) {
          await lastValueFrom(
            this.productService.updateStock({
              id: item.product_id,
              quantity: -item.quantity, // Negative to decrement stock
            }),
          );
          reservedItems.push(item.product_id);
          this.logger.log(`Reserved ${item.quantity} units of product ${item.product_id}`);
        }
      } catch (stockError) {
        // ROLLBACK: Restore stock for successfully reserved items
        this.logger.error('Stock reservation failed, rolling back...');
        for (const productId of reservedItems) {
          const item = enrichedItems.find((i) => i.product_id === productId);
          if (item) {
            try {
              await lastValueFrom(
                this.productService.updateStock({
                  id: productId,
                  quantity: item.quantity, // Positive to restore stock
                }),
              );
              this.logger.log(`Rolled back ${item.quantity} units for product ${productId}`);
            } catch (rollbackError) {
              this.logger.error(`Failed to rollback stock for ${productId}:`, rollbackError);
            }
          }
        }
        throw new RpcException({
          code: 13, // INTERNAL
          message: `Stock reservation failed: ${stockError.message}`,
        });
      }

      // STEP 5: Create order using internal createOrder method
      this.logger.log('Step 5: Creating order...');
      const order = await this.createOrder({
        user_id: user.id,
        items: enrichedItems,
      });

      this.logger.log(`Order created successfully: ${order.id}`);

      return order;
    } catch (error) {
      this.logger.error('Order placement failed:', error.message);

      // Re-throw RpcException as-is
      if (error instanceof RpcException) {
        throw error;
      }

      // Wrap other errors in RpcException
      throw new RpcException({
        code: 13, // INTERNAL
        message: `Failed to place order: ${error.message}`,
      });
    }
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    this.logger.log(`Creating order for user: ${data.user_id}`);

    // Validate request
    if (!data.user_id || !data.items || data.items.length === 0) {
      throw new RpcException({
        code: 3, // INVALID_ARGUMENT
        message: 'User ID and items are required',
      });
    }

    // Validate all items have valid prices (caller is responsible for fetching prices)
    for (const item of data.items) {
      if (!item.price || item.price <= 0) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: `Invalid price for product ${item.product_id}. Caller must provide valid prices.`,
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new RpcException({
          code: 3, // INVALID_ARGUMENT
          message: `Invalid quantity for product ${item.product_id}`,
        });
      }
    }

    // Calculate total amount from items (prices provided by caller)
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    this.logger.log(`Calculated total amount: ${totalAmount} for ${data.items.length} items`);

    // Create order entity with calculated total
    const order = this.orderRepository.create({
      userId: data.user_id,
      status: OrderStatus.CREATED,
      totalAmount,
    });

    // Save order first to get ID for order items
    const savedOrder: OrderEntity = await this.orderRepository.save(order);

    // Create order items
    const orderItems: OrderItemEntity[] = data.items.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }),
    );

    // Save all order items in batch
    await this.orderItemRepository.save(orderItems);

    // Load the complete order with items
    const completeOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });

    if (!completeOrder) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Failed to retrieve created order',
      });
    }

    this.logger.log(`Order created successfully: ${completeOrder.id}`);
    return this.mapToProtoOrder(completeOrder);
  }

  async findOrderById(data: FindOrderByIdRequest): Promise<Order> {
    this.logger.log(`Finding order by ID: ${data.id}`);

    const order = await this.orderRepository.findOne({
      where: { id: data.id },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Order with ID ${data.id} not found`,
      });
    }

    return this.mapToProtoOrder(order);
  }

  async findOrdersByUserId(
    data: FindOrdersByUserIdRequest,
  ): Promise<OrderList> {
    const page = data.page || 1;
    const limit = data.limit || 10;

    this.logger.log(
      `Finding orders for user: ${data.user_id}, page: ${page}, limit: ${limit}`,
    );

    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId: data.user_id },
      relations: ['items'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      orders: orders.map((order) => this.mapToProtoOrder(order)),
      total,
    };
  }

  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<Order> {
    this.logger.log(`Updating order ${data.id} status to ${data.status}`);

    const order = await this.orderRepository.findOne({
      where: { id: data.id },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Order with ID ${data.id} not found`,
      });
    }

    order.status = data.status;
    const updatedOrder = await this.orderRepository.save(order);

    return this.mapToProtoOrder(updatedOrder);
  }

  async cancelOrder(data: CancelOrderRequest): Promise<Order> {
    this.logger.log(`Cancelling order: ${data.id}`);

    const order = await this.orderRepository.findOne({
      where: { id: data.id },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Order with ID ${data.id} not found`,
      });
    }

    // Can only cancel orders in CREATED status
    if (order.status !== OrderStatus.CREATED) {
      throw new RpcException({
        code: 9, // FAILED_PRECONDITION
        message: `Cannot cancel order with status ${order.status}`,
      });
    }

    order.status = OrderStatus.FAILED;
    const cancelledOrder = await this.orderRepository.save(order);

    return this.mapToProtoOrder(cancelledOrder);
  }

  /**
   * Server Streaming RPC - Watch Order Status
   * Simulates real-time order status updates
   */
  watchOrderStatus(data: WatchOrderStatusRequest): Observable<OrderStatusUpdate> {
    this.logger.log(`Starting order status watch for order: ${data.order_id}`);

    // Create an observable that emits status updates over time
    return new Observable<OrderStatusUpdate>((subscriber) => {
      // Validate order exists first
      this.orderRepository.findOne({ where: { id: data.order_id } })
        .then((order) => {
          if (!order) {
            subscriber.error(new RpcException({
              code: 5, // NOT_FOUND
              message: `Order with ID ${data.order_id} not found`,
            }));
            return;
          }

          this.logger.log(`Order found: ${order.id}, current status: ${order.status}`);

          // Simulated order status progression
          const statusProgression = [
            { status: OrderStatus.CREATED, message: 'Order created successfully', delayMs: 0 },
            { status: OrderStatus.PAID, message: 'Payment processed', delayMs: 2000 },
            { status: OrderStatus.PROCESSING, message: 'Order is being prepared', delayMs: 3000 },
            { status: OrderStatus.SHIPPED, message: 'Order has been shipped', delayMs: 3000 },
            { status: OrderStatus.OUT_FOR_DELIVERY, message: 'Out for delivery', delayMs: 4000 },
            { status: OrderStatus.DELIVERED, message: 'Order delivered successfully!', delayMs: 3000 },
          ];

          let currentIndex = 0;

          const emitNext = () => {
            if (currentIndex >= statusProgression.length) {
              subscriber.complete();
              return;
            }

            const update = statusProgression[currentIndex];
            const statusUpdate: OrderStatusUpdate = {
              order_id: data.order_id,
              status: update.status,
              message: update.message,
              timestamp: new Date().toISOString(),
            };

            subscriber.next(statusUpdate);
            this.logger.log(`Emitted status update: ${update.status} for order ${data.order_id}`);

            currentIndex++;

            if (currentIndex < statusProgression.length) {
              setTimeout(emitNext, statusProgression[currentIndex].delayMs);
            } else {
              subscriber.complete();
            }
          };

          // Start emitting
          emitNext();
        })
        .catch((error) => {
          this.logger.error('Error validating order:', error);
          subscriber.error(new RpcException({
            code: 13, // INTERNAL
            message: `Failed to validate order: ${error.message}`,
          }));
        });
    });
  }

  interactiveOrderTracking(
    queries$: Observable<TrackingQuery>,
  ): Observable<TrackingResponse> {
  
    this.logger.log('🔄 Starting interactive order tracking');
  
    return new Observable<TrackingResponse>((subscriber) => {
  
      let statusUpdateInterval: NodeJS.Timeout | null = null;
      let currentStatusIndex = 0;
      let isSubscribed = false;
      let orderId: string | null = null;
  
      const statusProgression = [
        OrderStatus.PAID,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
      ];
  
      const querySubscription = queries$.subscribe({
        next: async (query) => {
          const timestamp = new Date().toISOString();
          orderId = query.order_id;
  
          try {
            const order = await this.orderRepository.findOne({
              where: { id: orderId },
            });
  
            if (!order) {
              subscriber.next({
                order_id: orderId,
                type: ResponseType.ERROR,
                status: OrderStatus.CREATED,
                message: `Order not found`,
                timestamp,
              });
              return;
            }
  
            switch (query.type) {
  
              case QueryType.SUBSCRIBE:
                if (isSubscribed) return;
  
                isSubscribed = true;
  
                subscriber.next({
                  order_id: orderId,
                  type: ResponseType.CONFIRMATION,
                  status: order.status as OrderStatus,
                  message: `Subscribed. Current status: ${order.status}`,
                  timestamp,
                });
  
                statusUpdateInterval = setInterval(() => {
                  if (currentStatusIndex >= statusProgression.length) {
                    clearInterval(statusUpdateInterval!);
                    return;
                  }
  
                  const newStatus = statusProgression[currentStatusIndex++];
  
                  subscriber.next({
                    order_id: orderId!,
                    type: ResponseType.STATUS_UPDATE,
                    status: newStatus,
                    message: `Order status updated`,
                    timestamp: new Date().toISOString(),
                  });
  
                }, 3000);
  
                break;
  
              case QueryType.GET_STATUS:
                subscriber.next({
                  order_id: orderId,
                  type: ResponseType.STATUS_UPDATE,
                  status: order.status as OrderStatus,
                  message: `Current status`,
                  timestamp,
                });
                break;
  
              case QueryType.CANCEL_ORDER:
                order.status = OrderStatus.CANCELLED;
                await this.orderRepository.save(order);
  
                if (statusUpdateInterval) {
                  clearInterval(statusUpdateInterval);
                  statusUpdateInterval = null;
                }
  
                subscriber.next({
                  order_id: orderId,
                  type: ResponseType.CONFIRMATION,
                  status: OrderStatus.CANCELLED,
                  message: `Order cancelled`,
                  timestamp,
                });
                break;
  
              default:
                subscriber.next({
                  order_id: orderId,
                  type: ResponseType.ERROR,
                  status: order.status as OrderStatus,
                  message: `Unknown query type`,
                  timestamp,
                });
            }
  
          } catch (error) {
            subscriber.error(error);
          }
        },
  
        error: (err) => subscriber.error(err),
  
        complete: () => subscriber.complete(),
      });
  
      // 🔥 Proper teardown logic
      return () => {
        this.logger.log('🛑 Cleaning up stream');
  
        querySubscription.unsubscribe();
  
        if (statusUpdateInterval) {
          clearInterval(statusUpdateInterval);
        }
      };
    });
  }
  

  /**
   * Maps TypeORM Order entity to proto Order message
   */
  private mapToProtoOrder(order: OrderEntity): Order {
    return {
      id: order.id,
      user_id: order.userId,
      status: order.status as OrderStatus,
      total_amount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      created_at: order.createdAt.toISOString(),
    };
  }
}
