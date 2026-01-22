# E-Commerce Microservices - Implementation Plan

## 🎯 Use Case: Tech Gadget Store

**Scenario:** Customer browses products → registers account → adds items to cart → places order → payment processing → receives notifications

This flow exercises all 5 microservices and demonstrates distributed systems patterns.

---

## 📡 gRPC Communication Patterns

### 1. Unary RPC (Request-Response)
**Pattern:** Client sends 1 request → Server sends 1 response
**Examples:**
- `UserService.CreateUser` - Register new user
- `ProductService.FindProductById` - Get product details
- `OrderService.CreateOrder` - Place order
- `PaymentService.ProcessPayment` - Process payment

### 2. Server Streaming RPC
**Pattern:** Client sends 1 request → Server sends stream of responses
**Examples:**
- `OrderService.WatchOrderStatus` - Real-time order tracking (CREATED → PAID → SHIPPED → DELIVERED)
- `ProductService.WatchProductStock` - Live inventory monitoring for admin dashboard
- `NotificationService.StreamNotifications` - User's real-time notification feed

### 3. Client Streaming RPC
**Pattern:** Client sends stream of requests → Server sends 1 response
**Examples:**
- `ProductService.BulkCreateProducts` - Admin uploads CSV of 1000 products
- `ProductService.BulkUpdateStock` - Inventory system sends batch stock adjustments

### 4. Bi-directional Streaming RPC
**Pattern:** Both client and server stream messages simultaneously
**Examples:**
- `OrderService.LiveOrderTracking` - User subscribes to order + queries location interactively
- `ProductService.SyncInventory` - Warehouse sends updates, service confirms each immediately

---

## 🔄 Core Workflows

### Workflow 1: User Registration (Simple)
```
Client → Gateway → User Service → User DB
                 ↓
          Notification Service (welcome email)
```

### Workflow 2: Browse Products (Simple)
```
Client → Gateway → Product Service → Product DB
```

### Workflow 3: Place Order (Complex - Main Learning Goal)
```
Client: { userId, items: [{productId, quantity}] }
  ↓
Gateway validates
  ↓
1. User Service: Verify user exists
2. Product Service: Check stock (parallel for each item)
3. Product Service: Reserve stock (decrement)
4. Order Service: Create order (status=CREATED)
5. Payment Service: Process payment
  ↓
If payment SUCCESS:
  - Order → status=PAID
  - Notification → confirmation email

If payment FAILED:
  - Order → status=FAILED
  - Product → rollback stock (increment)
  - Notification → failure email
```

### Workflow 4: Cancel Order (Medium)
```
Client → Gateway → Order Service (verify status=CREATED)
                 → Product Service (restore stock)
                 → Notification Service (cancellation email)
```

### Workflow 5: Real-time Order Tracking (Streaming)
```
Client opens tracking page
  ↓
Gateway establishes stream with Order Service
  ↓
Client receives: StatusUpdate → StatusUpdate → StatusUpdate...
Client sends: GetLocation query
Server responds: LocationInfo in stream
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Unary RPC) - 95% Complete
**Goal:** Basic CRUD operations with gRPC

**Tasks:**
- [x] Setup proto compilation (generate TS interfaces)
- [x] Implement User Service: CreateUser, FindUserByEmail, ValidateUser
- [x] Implement Product Service: CreateProduct, FindAllProducts, CheckStock, UpdateStock, FindProductById
- [x] Gateway: gRPC clients for User & Product
- [x] Gateway: GraphQL resolvers (registerUser, getUser, login, getProducts, getProduct, createProduct, checkStock)
- [ ] Client: User registration form, product list display

**Learning:** gRPC basics, @GrpcMethod decorators, ClientGrpc injection, error handling

---

### Phase 2: Order Creation (Unary RPC)
**Goal:** Multi-service orchestration

**Tasks:**
- [ ] Order Service: CreateOrder (calculate totalAmount from items)
- [ ] Product Service: UpdateStock (atomic decrement)
- [ ] Gateway: Orchestrate user validation + stock check + order creation
- [ ] Client: Shopping cart state, checkout flow

**Learning:** Sequential vs parallel gRPC calls, transaction boundaries, error propagation

---

### Phase 3: Payment Integration (Unary RPC + Saga Pattern)
**Goal:** Distributed transactions with rollback

**Tasks:**
- [ ] Payment Service: ProcessPayment (mock provider with random success/fail)
- [ ] Order Service: UpdateOrderStatus
- [ ] Gateway: Extend PlaceOrder mutation (add payment step)
- [ ] Implement rollback: restore stock if payment fails
- [ ] Client: Payment form, order confirmation page

**Learning:** Saga pattern, compensating transactions, idempotency, timeout handling

---

### Phase 4: Notifications (Unary RPC + Events)
**Goal:** Event-driven communication

**Tasks:**
- [ ] Notification Service: SendOrderConfirmation, SendPaymentNotification
- [ ] Gateway: Trigger notifications after payment result
- [ ] Notification Service: Store notifications in DB
- [ ] Client: Notification history page

**Learning:** Fire-and-forget patterns, async messaging, event emission

---

### Phase 5: Server Streaming
**Goal:** Real-time data push from server

**Tasks:**
- [ ] Order Service: WatchOrderStatus (returns Observable<StatusUpdate>)
- [ ] Product Service: WatchProductStock (for admin dashboard)
- [ ] Gateway: GraphQL subscriptions (WebSocket)
- [ ] Client: Real-time order tracking component with WebSocket

**Learning:** RxJS Observables, GraphQL subscriptions, WebSocket lifecycle, memory leak prevention

---

### Phase 6: Client Streaming
**Goal:** Bulk upload operations

**Tasks:**
- [ ] Product Service: BulkCreateProducts (stream → summary response)
- [ ] Product Service: BulkUpdateStock
- [ ] Admin panel: CSV upload with progress indicator
- [ ] Implement streaming CSV parser

**Learning:** Stream buffering, backpressure, file parsing, progress tracking

---

### Phase 7: Bi-directional Streaming
**Goal:** Interactive concurrent streams

**Tasks:**
- [ ] Order Service: LiveOrderTracking (subscribe + query simultaneously)
- [ ] Product Service: SyncInventory (warehouse sync)
- [ ] Client: Interactive tracking page (subscribe + user can ask "where is it?")
- [ ] Handle reconnection logic

**Learning:** Concurrent message handling, state in streaming context, race conditions, connection pooling

---

## 🎓 Learning Objectives Summary

**Phase 1-4 (Unary RPC):**
- gRPC server/client setup in NestJS
- GraphQL gateway pattern (API aggregation)
- Multi-service orchestration
- Distributed transactions (Saga pattern)
- Error handling & rollback logic
- Database design with TypeORM

**Phase 5 (Server Streaming):**
- Observable patterns in NestJS
- GraphQL subscriptions
- WebSocket management
- Real-time data push

**Phase 6 (Client Streaming):**
- Stream processing
- Bulk operations
- Progress tracking
- File upload patterns

**Phase 7 (Bi-directional Streaming):**
- Concurrent streams
- Interactive RPC
- Connection lifecycle
- Advanced state management

---

## 🚀 Quick Start

```bash
# Start with Phase 1
npm run db:up
npm run dev:all

# Check current state
curl http://localhost:3001  # User Service
curl http://localhost:3002  # Product Service
curl http://localhost:4000/graphql  # Gateway
```

---

## 📖 Related Documentation

- See `CLAUDE.md` for repository structure and daily commands
- Proto definitions in `libs/proto/src/`
- Entity models in `services/*/src/entities/`
