# E-Commerce Microservices

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![gRPC](https://img.shields.io/badge/gRPC-All%204%20Patterns-orange)](https://grpc.io/)
[![License](https://img.shields.io/badge/License-ISC-green)](./LICENSE)

A **fully functional** microservices architecture demonstrating modern backend development with **NestJS**, **gRPC** (all 4 patterns), **GraphQL**, **PostgreSQL**, and **Docker**.

**Perfect for learning:** Complete implementation of microservices with real-time features, from local development to Docker deployment.

## 🚀 Quick Start

### Local Development
```bash
# Complete setup (first time only)
npm run setup

# Start all services
npm run dev:all
```

**That's it!** Open http://localhost:3000 to see the client.

### Docker Deployment
```bash
# Start with Docker Compose
docker compose up -d

# Access at http://localhost:3000
```

## 🏗️ Architecture

```
Client (React + Vite + TypeScript)
    ↓ GraphQL + WebSocket
API Gateway (NestJS + Apollo Server)
    ↓ gRPC (Unary + Streaming)
┌─────────────────────────────────────┐
│      Microservices (NestJS)         │
│  • User Service    (gRPC: 5001)     │
│  • Product Service (gRPC: 5002)     │
│  • Order Service   (gRPC: 5003)     │
└─────────────────────────────────────┘
    ↓ TypeORM
PostgreSQL (Database per Service)
```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, GraphQL-Request, graphql-ws
- **Backend:** NestJS, TypeScript
- **Communication:** gRPC (all 4 patterns), GraphQL (Apollo Server)
- **Databases:** PostgreSQL (database-per-service pattern)
- **ORM:** TypeORM with migrations
- **Containers:** Docker, Docker Compose
- **Monorepo:** NPM Workspaces

### gRPC Communication Patterns
- ✅ **Unary RPC** - Request-response (CRUD operations)
- ✅ **Server Streaming** - Real-time order tracking
- ✅ **Client Streaming** - Bulk product upload (CSV import)
- ✅ **Bidirectional Streaming** - Interactive order tracking with queries

## 📦 Project Structure

```
ecommerce-microservices/
├── apps/
│   ├── client/                  # React frontend (Vite + TypeScript)
│   └── gateway/                 # GraphQL API Gateway (NestJS)
├── services/
│   ├── user-service/            # User management (gRPC)
│   ├── product-service/         # Product catalog (gRPC)
│   └── order-service/           # Order processing (gRPC)
├── libs/
│   └── proto/                   # gRPC proto definitions
├── docker-compose.yml           # Database containers
└── package.json                 # Monorepo commands
```

## 🔧 Common Commands

### Development
```bash
npm run dev:all              # Start everything
npm run dev:services         # Start backend only
npm run dev:client           # Start client only
```

### Database
```bash
npm run db:up               # Start databases
npm run db:down             # Stop databases
npm run db:ps               # Check status
npm run migration:run:all   # Run all migrations
```

### Maintenance
```bash
npm run install:all         # Install dependencies
npm run build:all           # Build everything
npm run clean               # Clean node_modules
```

## 🌐 Service Ports

| Service | URL | gRPC | Database |
|---------|-----|------|----------|
| Client | http://localhost:3000 | - | - |
| Gateway | http://localhost:4000/graphql | - | - |
| User Service | - | :5001 | :5433 |
| Product Service | - | :5002 | :5434 |
| Order Service | - | :5003 | :5435 |

## ✨ Features

### Implemented
- ✅ **Microservices Architecture** - Independent, scalable services
- ✅ **gRPC Communication** - All 4 patterns (Unary, Server Streaming, Client Streaming, Bidirectional)
- ✅ **GraphQL API Gateway** - Apollo Server with subscriptions over WebSocket
- ✅ **Database per Service** - PostgreSQL with TypeORM migrations
- ✅ **Docker Support** - Multi-stage builds, health checks, docker-compose
- ✅ **Real-time Features** - WebSocket subscriptions for live order tracking
- ✅ **Bulk Operations** - Client streaming for bulk product uploads
- ✅ **Interactive Tracking** - Bidirectional streaming for order queries

### Future Enhancements
- 🔮 **Kubernetes Deployment** - StatefulSets, Deployments, Ingress, Kustomize
- 🔮 **CI/CD Pipeline** - GitHub Actions with automated testing and deployment
- 🔮 **Payment Service** - Saga pattern for distributed transactions
- 🔮 **Notification Service** - Email/SMS notifications
- 🔮 **Monitoring** - Prometheus + Grafana
- 🔮 **Distributed Tracing** - Jaeger for request tracking
- 🔮 **Authentication** - JWT + OAuth
- 🔮 **Message Queue** - RabbitMQ/Kafka integration
- 🔮 **Cloud Deployment** - GKE, EKS, or AKS

## 🔒 Security Features

- Environment variable configuration
- Separate databases per service
- gRPC for internal communication only
- GraphQL API gateway for public access

## 🧪 Development Workflow

1. **Start databases:** `npm run db:up`
2. **Run migrations:** `npm run migration:run:all`
3. **Start services:** `npm run dev:all`
4. **Make changes** - hot reload enabled!
5. **Stop everything:** `Ctrl+C` and `npm run db:down`

## 🐛 Troubleshooting

### Services won't start
```bash
npm run clean
npm run install:all
npm run db:up
npm run migration:run:all
npm run dev:all
```

### Port conflicts
```bash
lsof -i :3001  # Check what's using the port
kill -9 <PID>  # Kill the process
```

### Database issues
```bash
npm run db:down
npm run db:up
npm run migration:run:all
```

## 🎯 Getting Started

### 1. Choose Your Deployment Method

**Local Development** (fastest for learning):
```bash
npm run setup && npm run dev:all
```

**Docker Compose** (production-like locally):
```bash
docker compose up -d
```

### 2. Explore the Features

- **Browse Products** - http://localhost:3000
- **Place Orders** - Add items to cart and checkout
- **Track Orders** - Real-time status updates (server streaming)
- **Bulk Upload** - CSV product import (client streaming)
- **Interactive Tracking** - Query order status live (bidirectional streaming)

### 3. Learn by Exploring

Each phase demonstrates different gRPC patterns:
- **Phase 1-2:** Unary RPC (CRUD operations)
- **Phase 4:** Server Streaming (real-time tracking)
- **Phase 5:** Client Streaming (bulk uploads)
- **Phase 6:** Bidirectional Streaming (interactive queries)

### 4. Next Steps

Want to extend the project? Check out [Future Enhancements](#future-enhancements) for ideas like:
- Kubernetes deployment with auto-scaling
- CI/CD pipeline with GitHub Actions
- Payment processing with Saga pattern
- Monitoring with Prometheus/Grafana


## 🤝 Contributing

This is a learning project demonstrating microservices architecture with all 4 gRPC patterns. Feel free to:
- Fork and experiment
- Report issues
- Suggest improvements
- Add new features (see [Future Enhancements](#future-enhancements))

## 📝 License

ISC

## 🏆 Project Status

**Current Status:** ✅ Fully Functional

Core implementation complete:
- ✅ Phase 1-2: Unary RPC & CRUD
- ✅ Phase 4: Server Streaming RPC
- ✅ Phase 5: Client Streaming RPC
- ✅ Phase 6: Bidirectional Streaming RPC

**Next:** Kubernetes deployment, CI/CD pipeline (see [Future Enhancements](#future-enhancements))

**Last Updated:** 2025

**Built for Learning:** This project demonstrates building microservices with gRPC, GraphQL, and real-time features.

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [gRPC Documentation](https://grpc.io/docs)
- [GraphQL Documentation](https://graphql.org/learn)
- [TypeORM Documentation](https://typeorm.io)
- [Docker Documentation](https://docs.docker.com)
