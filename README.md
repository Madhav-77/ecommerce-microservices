# E-Commerce Microservices

A complete microservices architecture learning project built with NestJS, gRPC, GraphQL, PostgreSQL, and Docker.

## 🚀 Quick Start

```bash
# Complete setup (first time only)
npm run setup

# Start all services
npm run dev:all
```

**That's it!** Open http://localhost:3000 to see the client.

## 📚 Documentation

- **[START.md](./START.md)** - Step-by-step startup guide
- **[COMMANDS.md](./COMMANDS.md)** - Complete NPM commands reference
- **[DOCKER.md](./DOCKER.md)** - Docker usage guide
- **[SETUP.md](./SETUP.md)** - Environment setup guide

## 🏗️ Architecture

This project demonstrates a complete microservices system:

```
Client (React + Vite)
    ↓ GraphQL
API Gateway (Apollo Server)
    ↓ gRPC
┌────────────────────────────────┐
│     Microservices (NestJS)     │
│  - User Service                │
│  - Product Service             │
│  - Order Service               │
│  - Payment Service             │
│  - Notification Service        │
└────────────────────────────────┘
    ↓ SQL
PostgreSQL Databases (5 separate DBs)
```

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** NestJS, TypeScript
- **Communication:** gRPC (services), GraphQL (client ↔ gateway)
- **Databases:** PostgreSQL (database-per-service pattern)
- **ORM:** TypeORM with migrations
- **Containerization:** Docker, Docker Compose
- **Monorepo:** NPM Workspaces

## 📦 Project Structure

```
ecommerce-microservices/
├── apps/
│   └── client/              # React frontend
├── services/
│   ├── user-service/        # User management
│   ├── product-service/     # Product catalog
│   ├── order-service/       # Order processing
│   ├── payment-service/     # Payment handling
│   └── notification-service/# Notifications
├── libs/
│   └── proto/              # Shared gRPC proto files
├── docker-compose.yml      # Database containers
└── package.json           # Root commands
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

See [COMMANDS.md](./COMMANDS.md) for complete list.

## 🌐 Service Ports

| Service | HTTP | gRPC | Database |
|---------|------|------|----------|
| Client | 3000 | - | - |
| User | 3001 | 5001 | 5433 |
| Product | 3002 | 5002 | 5434 |
| Order | 3003 | 5003 | 5435 |
| Payment | 3004 | 5004 | 5436 |
| Notification | 3005 | 5005 | 5437 |

## 🎓 Learning Objectives

This project demonstrates:

- **Microservices Architecture** - Independent, scalable services
- **gRPC Communication** - Efficient inter-service communication
- **GraphQL API** - Flexible client-server communication
- **Database per Service** - Data isolation and independence
- **Docker Containerization** - Consistent environments
- **TypeORM Migrations** - Database schema management
- **Monorepo Management** - Shared code and dependencies

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

## 📖 Next Steps

1. ✅ Setup complete - services running
2. 🚧 Create API Gateway with GraphQL
3. 🚧 Implement gRPC in services
4. 🚧 Connect client to gateway
5. 🚧 Add authentication
6. 🚧 Implement full order flow

## 🤝 Contributing

This is a learning project. Feel free to:
- Fork and experiment
- Report issues
- Suggest improvements

## 📝 License

ISC

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [gRPC Documentation](https://grpc.io/docs)
- [GraphQL Documentation](https://graphql.org/learn)
- [TypeORM Documentation](https://typeorm.io)
- [Docker Documentation](https://docs.docker.com)
