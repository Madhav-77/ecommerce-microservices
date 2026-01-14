# Proto Library

Shared gRPC protocol buffer definitions for all microservices.

## Structure

```
libs/proto/
├── src/                    # Proto source files
│   ├── user.proto         # User service contract
│   ├── product.proto      # Product service contract
│   ├── order.proto        # Order service contract
│   ├── payment.proto      # Payment service contract
│   └── notification.proto # Notification service contract
├── generated/             # Auto-generated TypeScript code (gitignored)
└── package.json
```

## Proto File Anatomy

Each proto file defines:

### 1. Service Definition
```protobuf
service UserService {
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc FindUserById (FindUserByIdRequest) returns (User);
}
```

### 2. Message Types
```protobuf
message User {
  string id = 1;
  string email = 2;
  string name = 3;
}

message CreateUserRequest {
  string email = 1;
  string name = 2;
  string password = 3;
}
```

### 3. Enums (if applicable)
```protobuf
enum OrderStatus {
  CREATED = 0;
  PAID = 1;
  FAILED = 2;
}
```

## Service Contracts

### User Service (`user.proto`)
- **CreateUser**: Register new user
- **FindUserById**: Get user by ID
- **FindUserByEmail**: Get user by email
- **UpdateUser**: Update user details
- **DeleteUser**: Delete user
- **ValidateUser**: Authenticate user (login)

### Product Service (`product.proto`)
- **CreateProduct**: Add new product to catalog
- **FindProductById**: Get product details
- **FindAllProducts**: List all products (paginated)
- **UpdateProduct**: Update product details
- **DeleteProduct**: Remove product
- **UpdateStock**: Increase/decrease stock
- **CheckStock**: Verify stock availability

### Order Service (`order.proto`)
- **CreateOrder**: Create new order
- **FindOrderById**: Get order details
- **FindOrdersByUserId**: Get user's order history
- **UpdateOrderStatus**: Change order status (CREATED → PAID → FAILED)
- **CancelOrder**: Cancel an order

### Payment Service (`payment.proto`)
- **ProcessPayment**: Process payment for order
- **FindPaymentById**: Get payment details
- **FindPaymentByOrderId**: Get payment for specific order
- **RefundPayment**: Refund a payment

### Notification Service (`notification.proto`)
- **SendNotification**: Send generic notification
- **FindNotificationById**: Get notification details
- **FindNotificationsByUserId**: Get user's notifications
- **SendOrderConfirmation**: Send order confirmation email
- **SendPaymentNotification**: Send payment status notification

## Using Proto Files (Runtime Loading)

This project uses **runtime proto loading** with NestJS. Proto files are loaded directly by services at startup - no code generation needed!

Services reference proto files by path:
```typescript
// services/user-service/src/main.ts
app.connectMicroservice({
  transport: Transport.GRPC,
  options: {
    package: 'user',
    protoPath: join(__dirname, '../../../libs/proto/src/user.proto'),
    url: '0.0.0.0:5001',
  },
});
```

## Using Proto in Services

### Server Side (Implementing gRPC Service)

```typescript
// services/user-service/src/user.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class UserController {
  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<User> {
    // Implementation
    return {
      id: '123',
      email: data.email,
      name: data.name,
      created_at: new Date().toISOString(),
    };
  }

  @GrpcMethod('UserService', 'FindUserById')
  async findUserById(data: FindUserByIdRequest): Promise<User> {
    // Implementation
    return await this.userService.findById(data.id);
  }
}
```

### Client Side (Calling Another Service)

```typescript
// services/order-service/src/order.service.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface ProductService {
  checkStock(data: CheckStockRequest): Observable<CheckStockResponse>;
  updateStock(data: UpdateStockRequest): Observable<Product>;
}

@Injectable()
export class OrderService implements OnModuleInit {
  private productService: ProductService;

  constructor(
    @Inject('PRODUCT_SERVICE') private productClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService = this.productClient.getService<ProductService>('ProductService');
  }

  async createOrder(data: CreateOrderRequest) {
    // Check stock availability via gRPC
    const stockCheck = await firstValueFrom(
      this.productService.checkStock({
        id: data.items[0].product_id,
        required_quantity: data.items[0].quantity,
      })
    );

    if (!stockCheck.available) {
      throw new Error('Insufficient stock');
    }

    // Create order logic...
  }
}
```

## Service Communication Flow

```
┌─────────────┐                           ┌──────────────┐
│   Gateway   │──── gRPC (user.proto) ───►│ User Service │
│  (GraphQL)  │                           └──────────────┘
└─────────────┘
       │
       │ gRPC (order.proto)
       ▼
┌──────────────┐                          ┌─────────────────┐
│Order Service │── gRPC (product.proto) ─►│ Product Service │
└──────────────┘                          └─────────────────┘
       │
       │ gRPC (payment.proto)
       ▼
┌────────────────┐
│Payment Service │
└────────────────┘
       │
       │ gRPC (notification.proto)
       ▼
┌────────────────────┐
│Notification Service│
└────────────────────┘
```

## Proto Best Practices

1. **Use meaningful names**: `CreateUserRequest`, not `CreateReq`
2. **Include all fields**: Even if optional, define all possible fields
3. **Use enums for status**: `OrderStatus.PAID` instead of string "paid"
4. **Version your APIs**: Add `v1` package if planning breaking changes
5. **Document with comments**: Add comments above services and messages
6. **Keep messages flat**: Avoid deep nesting when possible
7. **Use `optional` for nullable fields**: Makes intent clear

## Troubleshooting

### gRPC connection refused
Check:
1. Service is running on correct port (5001, 5002, etc.)
2. Proto package name matches in client and server
3. gRPC URL format: `0.0.0.0:5001` or `localhost:5001`
