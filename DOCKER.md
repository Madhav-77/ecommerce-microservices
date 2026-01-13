# Docker Setup Guide

## Overview

This project uses Docker and Docker Compose to run all microservices and databases in containers.

---

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- `.env` file in root directory (copy from `.env.example`)

---

## Quick Start

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Build All Services
```bash
docker-compose build
```

### 3. Start Everything
```bash
docker-compose up -d
```

This starts:
- 5 PostgreSQL databases (user, product, order, payment, notification)
- 5 NestJS microservices

### 4. Check Status
```bash
docker-compose ps
```

### 5. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f user-db
```

---

## Common Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start only databases
docker-compose up -d user-db product-db order-db payment-db notification-db

# Start specific service
docker-compose up -d user-service
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop but keep volumes (data persists)
docker-compose stop

# Stop and remove volumes (deletes data!)
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build user-service

# Rebuild and restart
docker-compose up -d --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# Last 100 lines
docker-compose logs --tail=100 user-service
```

### Execute Commands in Container

```bash
# Access shell
docker-compose exec user-service sh

# Run migrations
docker-compose exec user-service npm run migration:run

# Run commands without entering shell
docker-compose exec user-service npm run build
```

---

## Service URLs

When running in Docker, services communicate via container names:

### Internal (container-to-container):
- user-service: `http://user-service:3001` (HTTP), `user-service:5001` (gRPC)
- product-service: `http://product-service:3002` (HTTP), `product-service:5002` (gRPC)
- order-service: `http://order-service:3003` (HTTP), `order-service:5003` (gRPC)
- payment-service: `http://payment-service:3004` (HTTP), `payment-service:5004` (gRPC)
- notification-service: `http://notification-service:3005` (HTTP), `notification-service:5005` (gRPC)

### External (from host machine):
- user-service: `http://localhost:3001` (HTTP), `localhost:5001` (gRPC)
- product-service: `http://localhost:3002` (HTTP), `localhost:5002` (gRPC)
- order-service: `http://localhost:3003` (HTTP), `localhost:5003` (gRPC)
- payment-service: `http://localhost:3004` (HTTP), `localhost:5004` (gRPC)
- notification-service: `http://localhost:3005` (HTTP), `localhost:5005` (gRPC)

### Database Connections:

**From host machine:**
```bash
# User DB
psql -h localhost -p 5433 -U user_service -d user_db

# Product DB
psql -h localhost -p 5434 -U product_service -d product_db

# Order DB
psql -h localhost -p 5435 -U order_service -d order_db

# Payment DB
psql -h localhost -p 5436 -U payment_service -d payment_db

# Notification DB
psql -h localhost -p 5437 -U notification_service -d notification_db
```

**From services (in docker-compose.yml):**
- DB_HOST: `user-db`, `product-db`, etc. (container name)
- DB_PORT: `5432` (internal container port)

---

## Running Migrations

### Option 1: Via Docker Compose
```bash
docker-compose exec user-service npm run migration:run
docker-compose exec product-service npm run migration:run
docker-compose exec order-service npm run migration:run
docker-compose exec payment-service npm run migration:run
docker-compose exec notification-service npm run migration:run
```

### Option 2: Before Starting Services
Add to `docker-compose.yml` for each service:
```yaml
command: sh -c "npm run migration:run && npm run start:prod"
```

---

## Development Workflow

### Option 1: Full Docker (Recommended for Production-like Testing)
```bash
# Build and start everything
docker-compose up -d --build

# Make code changes
# Rebuild specific service
docker-compose up -d --build user-service

# View logs
docker-compose logs -f user-service
```

### Option 2: Hybrid (Databases in Docker, Services Local)
```bash
# Start only databases
docker-compose up -d user-db product-db order-db payment-db notification-db

# Run services locally
cd services/user-service && npm run start:dev
cd services/product-service && npm run start:dev
# etc...
```

**Note:** For hybrid mode, update service `.env` files:
```env
DB_HOST=localhost  # Not user-db!
DB_PORT=5433       # External port, not 5432
```

---

## Debugging

### Service won't start
```bash
# Check logs
docker-compose logs user-service

# Check if database is ready
docker-compose logs user-db

# Ensure .env file exists
ls -la .env
```

### Database connection error
```bash
# Verify DB_HOST in service environment
docker-compose config | grep DB_HOST

# Should be: DB_HOST=user-db (container name)
# NOT: DB_HOST=localhost
```

### Port conflicts
```bash
# Check if ports are already in use
lsof -i :3001
lsof -i :5433

# Kill process or change port in .env
```

### Clear everything and restart
```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## Production Considerations

### 1. Use Docker Secrets
Instead of environment variables in docker-compose.yml, use Docker secrets:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 2. Health Checks
Add health checks to docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 3. Multi-stage Builds
Already implemented in Dockerfiles (builder + production stage).

### 4. Resource Limits
Add resource constraints:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

### 5. Use Docker Swarm or Kubernetes
For orchestration and scaling in production.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot connect to database` | Check `DB_HOST` is container name, not localhost |
| `Port already in use` | Change port in `.env` or stop conflicting service |
| `Build failed` | Check Dockerfile syntax, ensure package.json exists |
| `Service exited with code 1` | Check logs: `docker-compose logs service-name` |
| `Volume permission denied` | Check Docker Desktop settings, file sharing |

---

## Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes data!)
docker-compose down -v

# Remove images
docker system prune -a

# Remove everything (nuclear option)
docker system prune -a --volumes
```
