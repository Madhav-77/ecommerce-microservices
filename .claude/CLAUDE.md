# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **learning project** building a microservices e-commerce system with NestJS, gRPC, GraphQL, PostgreSQL, and React. It's an NPM workspace monorepo demonstrating service-oriented architecture patterns.

**Current State:** Basic infrastructure is in place - 5 NestJS services with TypeORM + PostgreSQL, GraphQL gateway with Apollo Server, React client with graphql-request. Proto files define gRPC contracts but aren't yet integrated into services.

**Target Architecture:**
```
React Client (port 3000)
    ↓ GraphQL
API Gateway (port 4000)
    ↓ gRPC
Microservices (ports 3001-3005)
    ↓ TypeORM
PostgreSQL DBs (ports 5433-5437)
```

## Repository Structure

```
ecommerce-microservices/
├── apps/
│   ├── client/          # React 18 + Vite + TypeScript
│   └── gateway/         # NestJS + Apollo Server (GraphQL)
├── services/
│   ├── user-service/    # User management (port 3001, DB 5433)
│   ├── product-service/ # Product catalog (port 3002, DB 5434)
│   ├── order-service/   # Order processing (port 3003, DB 5435)
│   ├── payment-service/ # Payment handling (port 3004, DB 5436)
│   └── notification-service/ # Notifications (port 3005, DB 5437)
└── libs/
    └── proto/           # gRPC proto definitions (not yet integrated)
```

## Essential Commands

### First-Time Setup
```bash
npm run setup  # Installs deps, starts DBs, runs migrations
```

### Daily Development
```bash
# Start databases (do this first)
npm run db:up

# Start all services in one terminal (recommended)
npm run dev:all  # Color-coded logs: user(blue), product(green), order(yellow), payment(magenta), notification(cyan), client(white)

# OR start individually in separate terminals
npm run dev:gateway
npm run dev:user
npm run dev:product
npm run dev:order
npm run dev:payment
npm run dev:notification
npm run dev:client
```

### Database Operations
```bash
npm run db:up              # Start all 5 PostgreSQL containers
npm run db:down            # Stop and remove containers
npm run db:ps              # Check database status
npm run migration:run:all  # Run migrations for all services
```

### Individual Service Migrations
```bash
# IMPORTANT: Build before running migrations (TypeORM needs compiled JS)
npm run migration:run:user
npm run migration:run:product
npm run migration:run:order
npm run migration:run:payment
npm run migration:run:notification
```

### Build Commands
```bash
npm run build:all       # Build all services and apps
npm run build:services  # Build only microservices
npm run build:gateway   # Build only gateway
npm run build:client    # Build only client
```

## Architecture Patterns

### Database Per Service
Each microservice has its own PostgreSQL database with dedicated credentials. Database configuration is managed via `.env` files in each service directory, referencing root `.env` for Docker Compose.

**Database Ports:**
- user-db: 5433
- product-db: 5434
- order-db: 5435
- payment-db: 5436
- notification-db: 5437

### TypeORM Configuration
All services use `synchronize: false` in TypeORM config - **schema changes require migrations**. Never enable `synchronize: true` in production-like environments.

**Migration Workflow:**
1. Create entity changes in `src/entities/*.entity.ts`
2. Build the service: `cd services/[service-name] && npm run build`
3. Run migration: `npm run migration:run`

### Gateway GraphQL Setup
The gateway uses Apollo Server with **code-first approach**:
- Schema is auto-generated to `src/schema.gql` via `@nestjs/graphql` decorators
- Playground disabled, introspection enabled
- Resolvers in `apps/gateway/src/*.resolver.ts`
- GraphQL endpoint: `http://localhost:4000/graphql`

### Proto Files (Not Yet Integrated)
gRPC service contracts exist in `libs/proto/src/`:
- `user.proto` - User CRUD + validation
- `product.proto` - Product catalog + stock management
- `order.proto` - Order processing
- `payment.proto` - Payment transactions
- `notification.proto` - Notification delivery

These define the interface contracts but are **not yet implemented** in the services. When implementing gRPC, services will need `@nestjs/microservices` and proto compilation setup.

### Client-Gateway Communication
Client uses `graphql-request` library to query the gateway at `http://localhost:4000/graphql`. Sample queries exist in `apps/client/src/components/*.tsx` showing the connection pattern.

## Port Reference

| Component | HTTP Port | gRPC Port (planned) | Database Port |
|-----------|-----------|---------------------|---------------|
| Client | 3000 | - | - |
| Gateway | 4000 | - | - |
| User Service | 3001 | 5001 | 5433 |
| Product Service | 3002 | 5002 | 5434 |
| Order Service | 3003 | 5003 | 5435 |
| Payment Service | 3004 | 5004 | 5436 |
| Notification Service | 3005 | 5005 | 5437 |

## Development Patterns

### Hot Reload
All NestJS services and the React client have hot reload enabled. Code changes auto-refresh without manual restarts.

### Concurrent Services
`npm run dev:all` uses `concurrently` package to run all services in one terminal with color-coded output for easy log differentiation.

### Environment Variables
Root `.env` contains database credentials for Docker Compose. Each service has its own `.env` that references these for local development connections.

### TypeORM Entities
Entities follow naming conventions:
- Table names: plural (e.g., `@Entity('users')`)
- Column names: snake_case in DB (e.g., `@Column({ name: 'created_at' })`)
- Property names: camelCase in code (e.g., `createdAt: Date`)
- UUIDs: `@PrimaryGeneratedColumn('uuid')`

## Troubleshooting

### Services Won't Start
```bash
npm run clean && npm run install:all && npm run build:all
```

### Database Connection Failed
```bash
# Verify databases are running
npm run db:ps

# Restart if needed
npm run db:down && npm run db:up
```

### Migration Errors
Build the service first - TypeORM migrations require compiled JavaScript:
```bash
cd services/user-service
npm run build
npm run migration:run
```

### Port Conflicts
```bash
lsof -i :3001  # Check what's using the port
kill -9 <PID>  # Kill the process
```

## Testing Individual Services

To test a single service in isolation:
```bash
# Terminal 1: Databases
npm run db:up

# Terminal 2: Specific service
npm run dev:user

# Terminal 3: Check it's running
curl http://localhost:3001
```

## Next Implementation Steps

This project is a work in progress. The following features are defined but not yet implemented:

1. **gRPC Server Setup** - Add `@nestjs/microservices` and implement proto service definitions
2. **gRPC Client in Gateway** - Connect gateway to services via gRPC instead of direct calls
3. **GraphQL Schema Stitching** - Map GraphQL queries to underlying gRPC service calls
4. **Inter-Service Communication** - Enable services to call each other via gRPC
5. **End-to-End Flows** - Complete user → product → order → payment flow

When implementing these, refer to proto files in `libs/proto/src/` for the defined service contracts.
