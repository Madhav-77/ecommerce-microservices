# Docker Deployment Guide

## Overview

This project uses Docker and Docker Compose to run the complete e-commerce microservices stack:
- **5 PostgreSQL databases** (user, product, order, payment, notification)
- **3 Microservices** (user-service, product-service, order-service)
- **1 API Gateway** (GraphQL + WebSocket)
- **1 React Client** (SPA with Nginx)

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

## Phase 7: Full Stack Deployment

### New in Phase 7

✅ **Gateway Service** - GraphQL API with WebSocket subscriptions
✅ **React Client** - Production-ready SPA served by Nginx
✅ **Service Discovery** - Container-to-container communication via Docker network
✅ **Health Checks** - All services report health status
✅ **Environment Variables** - Configurable URLs for gateway and WebSocket

### Architecture

```
Client (Nginx)  →  Gateway (GraphQL)  →  Order Service (gRPC)
:3000               :4000                   :5003
                                        →  User Service (gRPC)
                                            :5001
                                        →  Product Service (gRPC)
                                            :5002
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Client | http://localhost:3000 | React frontend |
| Gateway | http://localhost:4000/graphql | GraphQL API |
| Gateway Health | http://localhost:4000/health | Health check |

### Testing the Full Stack

1. **Start everything**:
```bash
docker compose up -d
```

2. **Wait for health checks** (can take 1-2 minutes):
```bash
watch docker compose ps
```

3. **Access the client**:
```bash
open http://localhost:3000
```

4. **Test GraphQL**:
```bash
curl http://localhost:4000/health
```

5. **View logs**:
```bash
docker compose logs -f gateway client
```

### Environment Configuration

The client is built with these environment variables:
```yaml
args:
  VITE_GATEWAY_URL: http://localhost:4000/graphql
  VITE_WS_GATEWAY_URL: ws://localhost:4000/graphql
```

To change for production:
1. Update `docker-compose.yml` under `client` → `build` → `args`
2. Rebuild: `docker compose build client`

---

## Clean Up

```bash
# Stop and remove containers
docker compose down

# Remove volumes (deletes data!)
docker compose down -v

# Remove images
docker system prune -a

# Remove everything (nuclear option)
docker system prune -a --volumes
```

---

## Next Steps

After successful deployment:

1. **Add Monitoring** - Prometheus + Grafana
2. **Add Logging** - ELK stack or Loki
3. **Add Tracing** - Jaeger for distributed tracing
4. **Setup CI/CD** - Automated builds and deployments
5. **Production Deployment** - Kubernetes, AWS ECS, or Google Cloud Run

See [PLAN.md](./PLAN.md) for the complete roadmap.
