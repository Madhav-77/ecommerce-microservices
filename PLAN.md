# E-Commerce Microservices - Implementation Plan

## 🎯 Use Case: Tech Gadget Store

**Scenario:** Customer browses products → registers account → adds items to cart → places order

This flow exercises 3 core microservices (User, Product, Order) and demonstrates all 4 gRPC communication patterns.

---

## 📡 gRPC Communication Patterns (All 4 Covered)

### 1. Unary RPC (Request-Response) ✅ IMPLEMENTED
**Pattern:** Client sends 1 request → Server sends 1 response
**Examples:**
- `UserService.CreateUser` - Register new user
- `ProductService.FindProductById` - Get product details
- `OrderService.PlaceOrder` - Place order with multi-service orchestration

**Status:** 17 methods implemented across User, Product, Order services

---

### 2. Server Streaming RPC 🎯 PHASE 4
**Pattern:** Client sends 1 request → Server sends stream of responses
**Examples:**
- `OrderService.WatchOrderStatus` - Real-time order tracking (CREATED → PAID → SHIPPED → DELIVERED)
- `ProductService.WatchProductStock` - Live inventory monitoring for admin dashboard

**Learning:** RxJS Observables, GraphQL subscriptions, WebSocket lifecycle

---

### 3. Client Streaming RPC 🎯 PHASE 5
**Pattern:** Client sends stream of requests → Server sends 1 response
**Examples:**
- `ProductService.BulkCreateProducts` - Admin uploads CSV of 100+ products
- `ProductService.BulkUpdateStock` - Inventory system sends batch stock adjustments

**Learning:** Stream buffering, backpressure, file parsing, progress tracking

---

### 4. Bidirectional Streaming RPC 🎯 PHASE 6
**Pattern:** Both client and server stream messages simultaneously
**Examples:**
- `OrderService.LiveOrderTracking` - User subscribes to order + queries location interactively
- `ProductService.SyncInventory` - Warehouse sends updates, service confirms each immediately

**Learning:** Concurrent message handling, state in streaming context, race conditions

---

## 🔄 Core Workflows

### Workflow 1: User Registration (Simple)
```
Client → Gateway → User Service → User DB
```

### Workflow 2: Browse Products (Simple)
```
Client → Gateway → Product Service → Product DB
```

### Workflow 3: Place Order (Complex - Multi-Service Orchestration)
```
Client: { userEmail, items: [{productId, quantity}] }
  ↓
Gateway → Order Service (orchestration)
  ↓
1. User Service: Verify user exists
2. Product Service: Check stock (parallel for each item)
3. Product Service: Reserve stock (decrement)
4. Order Service: Create order (status=CREATED)
  ↓
Response: Order with items, totalAmount, status
```

**Note:** This demonstrates the Saga pattern foundation - stock reservation with automatic rollback on failure.

---

## 📋 Implementation Phases

### Phase 1: Foundation (Unary RPC) ✅ COMPLETE
**Goal:** Basic CRUD operations with gRPC

**Completed:**
- ✅ Setup proto compilation (generate TS interfaces)
- ✅ Implement User Service: CreateUser, FindUserByEmail, ValidateUser
- ✅ Implement Product Service: CreateProduct, FindAllProducts, CheckStock, UpdateStock, FindProductById
- ✅ Implement Order Service: PlaceOrder (orchestration), CreateOrder, FindOrderById, FindOrdersByUserId, UpdateOrderStatus, CancelOrder
- ✅ Gateway: gRPC clients for User, Product, Order services
- ✅ Gateway: GraphQL resolvers (mutations + queries for all services)
- ✅ Client: Full e-commerce UI (user creation, product management, shopping cart, checkout)

**Learning Achieved:** gRPC basics, @GrpcMethod decorators, ClientGrpc injection, error handling, multi-service orchestration

---

### Phase 2: Order Creation & Shopping Cart ✅ COMPLETE
**Goal:** Multi-service orchestration with shopping cart

**Completed:**
- ✅ Order Service: PlaceOrder with User+Product coordination
- ✅ Product Service: Stock reservation with rollback on failure
- ✅ Gateway: Orchestrate user validation + stock check + order creation
- ✅ Client: Shopping cart state management, checkout flow, order confirmation

**Learning Achieved:** Sequential vs parallel gRPC calls, transaction boundaries, error propagation, compensating transactions

---

### Phase 3: Complete CRUD Operations ⏳ NEXT
**Goal:** Finish missing Unary RPC methods

**Tasks:**
- [ ] User Service: Implement UpdateUser, DeleteUser (currently commented out)
- [ ] Product Service: Implement UpdateProduct, DeleteProduct (currently commented out)
- [ ] Gateway: Add GraphQL mutations for update/delete operations
- [ ] Test all CRUD operations via GraphQL Playground

**Time Estimate:** 30 minutes

**Learning:** Complete CRUD pattern mastery in microservices

---

### Phase 4: Server Streaming RPC ⏳ UPCOMING
**Goal:** Real-time data push from server

**Tasks:**
- [ ] Order Service: `WatchOrderStatus(orderId) → stream<StatusUpdate>`
  - Returns Observable that emits status changes every 2-3 seconds
  - Simulates: CREATED → PAID → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
- [ ] Product Service: `WatchProductStock(productId) → stream<StockUpdate>`
  - Emits when stock changes for live admin dashboard
- [ ] Update proto files with streaming definitions
- [ ] Gateway: GraphQL subscriptions (WebSocket)
  - `subscription { watchOrderStatus(orderId: "...") { status, timestamp } }`
- [ ] Client: Real-time order tracking component
  - Auto-updates without page refresh
  - WebSocket connection management

**Time Estimate:** 1-2 hours

**Learning:** RxJS Observables in NestJS, GraphQL subscriptions, WebSocket lifecycle, memory leak prevention, real-time data patterns

---

### Phase 5: Client Streaming RPC ⏳ UPCOMING
**Goal:** Bulk upload operations with streaming

**Tasks:**
- [ ] Product Service: `BulkCreateProducts(stream<Product>) → BulkCreateResponse`
  - Client streams products one by one
  - Server accumulates and returns summary: { created: 95, failed: 5, errors: [...] }
- [ ] Product Service: `BulkUpdateStock(stream<StockUpdate>) → BulkUpdateResponse`
  - Warehouse system sends batch stock adjustments
- [ ] Update proto files with client streaming definitions
- [ ] Gateway: Handle client streaming requests
  - Buffer incoming stream
  - Forward to Product Service
- [ ] Client: CSV upload component
  - File parsing with papaparse/csv-parser
  - Stream rows to backend
  - Progress bar showing upload status

**Time Estimate:** 1-2 hours

**Learning:** Client-side streaming, stream buffering, backpressure handling, file parsing and chunking, progress tracking, error handling in streams

---

### Phase 6: Bidirectional Streaming RPC ⏳ UPCOMING
**Goal:** Interactive concurrent streams

**Tasks:**
- [ ] Order Service: `LiveOrderTracking(stream<TrackingRequest>) → stream<TrackingResponse>`
  - User subscribes to order updates
  - User can query "where is my package?" mid-stream
  - Server responds with real-time location/status
  - Example flow:
    ```
    Client → Subscribe to order 123
    Server → Status: PAID
    Server → Status: SHIPPED
    Client → Query: Where is it now?
    Server → Location: Distribution Center, City XYZ
    Client → Query: ETA?
    Server → ETA: 2 hours
    Server → Status: DELIVERED
    ```
- [ ] Product Service: `SyncInventory(stream<InventoryUpdate>) → stream<SyncConfirmation>`
  - Warehouse sends stock updates in stream
  - Service confirms each update immediately in stream
  - Real-time two-way synchronization
- [ ] Update proto files with bidirectional streaming definitions
- [ ] Gateway: WebSocket with bidirectional support
  - Handle concurrent client→server and server→client messages
- [ ] Client: Interactive tracking page
  - Auto-receives updates from server
  - User can send queries during active tracking session
  - Connection state management (connecting, connected, disconnected)

**Time Estimate:** 2-3 hours

**Learning:** Concurrent bidirectional streams, state management in streaming context, race condition handling, message ordering & synchronization, connection lifecycle management, reconnection logic

---

### Phase 7: Dockerization & Deployment ⏳ FINAL PHASE
**Goal:** Containerize and orchestrate all services

**Tasks:**
- [ ] Create Dockerfile for Gateway (NestJS + GraphQL)
- [ ] Create Dockerfile for Client (Vite/React production build)
- [ ] Update docker-compose.yml with all services:
  - 3 PostgreSQL databases (user-db, product-db, order-db)
  - 3 microservices (user-service, product-service, order-service)
  - 1 gateway (GraphQL + WebSocket)
  - 1 client (React SPA)
- [ ] Add .dockerignore files for all services
- [ ] Configure Docker networking (service discovery via service names)
- [ ] Add health checks to all services
- [ ] Configure environment variables for Docker deployment
- [ ] Test full deployment: `docker-compose up`
- [ ] Document deployment process in README

**Time Estimate:** 2-3 hours

**Learning:** Multi-stage Docker builds, Docker Compose orchestration, container networking, service discovery, volume management, environment configuration, production-like deployment

---

## 🎓 Learning Objectives Summary

**Phases 1-3 (Unary RPC):**
- ✅ gRPC server/client setup in NestJS
- ✅ GraphQL gateway pattern (API aggregation)
- ✅ Multi-service orchestration
- ✅ Error handling & rollback logic
- ✅ Database design with TypeORM
- ✅ Complete CRUD operations

**Phase 4 (Server Streaming):**
- Observable patterns in NestJS
- GraphQL subscriptions
- WebSocket management
- Real-time data push

**Phase 5 (Client Streaming):**
- Stream processing
- Bulk operations
- Progress tracking
- File upload patterns

**Phase 6 (Bidirectional Streaming):**
- Concurrent streams
- Interactive RPC
- Connection lifecycle
- Advanced state management

**Phase 7 (Docker Deployment):**
- Containerization
- Multi-container orchestration
- Docker networking
- Production deployment

---

## ⏱️ Time Estimates

| Phase | Focus | Time |
|-------|-------|------|
| Phase 1-2 | Unary RPC (Completed) | ✅ Done |
| Phase 3 | Complete CRUD | 30 min |
| Phase 4 | Server Streaming | 1-2 hours |
| Phase 5 | Client Streaming | 1-2 hours |
| Phase 6 | Bidirectional Streaming | 2-3 hours |
| Phase 7 | Dockerization | 2-3 hours |
| **Total Remaining** | | **7-11 hours** |

---

## 🚀 Quick Start

```bash
# Current development setup
npm run db:up           # Start PostgreSQL databases
npm run dev:all         # Start all services + gateway + client

# After Phase 7 (Docker deployment)
docker-compose up       # Start entire stack in containers
```

**Check current state:**
```bash
curl http://localhost:3001          # User Service
curl http://localhost:3002          # Product Service
curl http://localhost:3003          # Order Service
curl http://localhost:4000/graphql  # Gateway (GraphQL Playground)
curl http://localhost:3000          # React Client
```

---

## 📖 Related Documentation

- See `CLAUDE.md` for repository structure and daily commands
- Proto definitions in `libs/proto/src/`
- Entity models in `services/*/src/entities/`
- GraphQL schema in `apps/gateway/src/schema.gql`

---

## 🔮 Future Enhancements

These features are **intentionally skipped** to focus on core learning objectives (gRPC patterns, GraphQL, Docker). They can be added later for advanced learning.

### **1. Payment Service & Saga Pattern**
**What it would add:**
- Payment Service with 4 gRPC methods:
  - `ProcessPayment` - Mock payment provider (80% success rate)
  - `FindPaymentById` - Get payment details
  - `FindPaymentByOrderId` - Get payment for specific order
  - `RefundPayment` - Process refunds
- Saga orchestration pattern:
  - Order Service calls Payment Service after order creation
  - On payment success: Update order status to PAID
  - On payment failure: Rollback stock reservation, mark order as FAILED
- Compensating transactions (undo operations on failure)
- Idempotency patterns (safe to retry operations)
- Timeout handling and circuit breaker patterns

**Why skipped:**
- Saga pattern is advanced, production-focused
- Order Service already demonstrates multi-service orchestration
- Adds complexity without introducing new gRPC concepts
- Can simulate payment in Order Service if needed

**Proto definition exists:** `libs/proto/src/payment.proto`
**Estimated effort:** 3-4 hours
**Learning value:** Distributed transactions, compensating actions, resilience patterns

---

### **2. Notification Service**
**What it would add:**
- Notification Service with 5 gRPC methods:
  - `SendNotification` - Generic notification sending
  - `FindNotificationById` - Get notification details
  - `FindNotificationsByUserId` - List user's notifications
  - `SendOrderConfirmation` - Triggered after order placement
  - `SendPaymentNotification` - Triggered after payment
- Event-driven communication patterns
- Fire-and-forget async messaging
- Notification history storage in database
- Email/SMS simulation (console logs or mock SMTP)

**Why skipped:**
- No new gRPC concepts (just more Unary RPC methods)
- Event-driven patterns can be learned elsewhere
- Focus is on synchronous gRPC communication
- Can add console logs in Order Service as substitute

**Proto definition exists:** `libs/proto/src/notification.proto`
**Estimated effort:** 2-3 hours
**Learning value:** Event-driven architecture, async patterns, notification systems

---

### **3. Advanced Authentication & Authorization**
**What it would add:**
- JWT token generation and validation
- Refresh token mechanism
- Role-based access control (RBAC)
- GraphQL field-level authorization
- gRPC metadata for auth headers
- Password hashing with bcrypt/argon2

**Why skipped:**
- Production security concerns, not core microservices learning
- Adds significant complexity across all services
- Can use basic email/password validation for now

**Estimated effort:** 4-5 hours
**Learning value:** Security patterns, JWT, RBAC, auth middleware

---

### **4. API Rate Limiting & Throttling**
**What it would add:**
- Rate limiting per user/IP
- Throttling for bulk operations
- Redis-based distributed rate limiting
- GraphQL query complexity analysis
- Cost-based query limiting

**Why skipped:**
- Production optimization, not fundamental concept
- Requires Redis setup
- Focus on learning gRPC/GraphQL patterns first

**Estimated effort:** 2-3 hours
**Learning value:** Performance optimization, abuse prevention

---

### **5. Monitoring & Observability**
**What it would add:**
- Prometheus metrics collection
- Grafana dashboards
- Distributed tracing with OpenTelemetry/Jaeger
- Structured logging with Winston/Pino
- Error tracking with Sentry
- Health check endpoints for all services

**Why skipped:**
- Production operations concern
- Requires additional infrastructure (Prometheus, Grafana)
- Focus on building functionality first

**Estimated effort:** 5-6 hours
**Learning value:** Observability, monitoring, production operations

---

### **6. CI/CD Pipeline**
**What it would add:**
- GitHub Actions workflow
- Automated testing on PR
- Docker image building and pushing
- Automated deployment to cloud (AWS ECS, Google Cloud Run, etc.)
- Environment-specific configurations (dev, staging, prod)

**Why skipped:**
- DevOps concern, not microservices architecture
- Requires cloud provider setup
- Can deploy manually for learning purposes

**Estimated effort:** 3-4 hours
**Learning value:** CI/CD, DevOps practices, cloud deployment

---

### **7. Message Queue Integration**
**What it would add:**
- RabbitMQ or Apache Kafka integration
- Async event publishing from services
- Event consumers for cross-service communication
- Event sourcing patterns
- Dead letter queues

**Why skipped:**
- Advanced async pattern
- Requires message broker infrastructure
- gRPC already covers synchronous communication well

**Estimated effort:** 4-5 hours
**Learning value:** Message queues, event-driven architecture, eventual consistency

---

### **8. Database Migrations & Seeding**
**What it would add:**
- Automated migration generation from entity changes
- Database seeding scripts for test data
- Migration rollback capabilities
- Data fixtures for testing

**Why skipped:**
- Already covered basics with TypeORM migrations
- Can manually seed data for now
- Focus on service communication

**Estimated effort:** 1-2 hours
**Learning value:** Database management, data seeding strategies

---

### **9. End-to-End Testing**
**What it would add:**
- E2E tests with Jest/Supertest
- Integration tests across services
- Contract testing for gRPC APIs
- Test fixtures and mocks
- CI pipeline for automated testing

**Why skipped:**
- Testing best practices, not core functionality
- Adds significant time to development
- Manual testing sufficient for learning

**Estimated effort:** 6-8 hours
**Learning value:** Testing strategies, quality assurance

---

### **10. API Versioning**
**What it would add:**
- gRPC service versioning (v1, v2)
- GraphQL schema versioning
- Backward compatibility strategies
- Deprecation warnings

**Why skipped:**
- Advanced API design concern
- Not needed for single-version learning project

**Estimated effort:** 2-3 hours
**Learning value:** API evolution, backward compatibility

---

## 📊 Total Time Investment

**Current Plan (Core Learning):** 7-11 hours remaining
**Future Enhancements (Optional):** 35-45+ additional hours

**Recommendation:** Complete Phases 3-7 first to master gRPC, GraphQL, and Docker fundamentals. Then selectively add Future Enhancements based on specific learning interests.
