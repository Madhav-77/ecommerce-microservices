# Environment Setup Guide

## Quick Start

### 1. Create Root Environment File

Copy the example environment file and customize with your credentials:

```bash
cp .env.example .env
```

**Important**: Never commit the `.env` file to version control!

### 2. Create Service Environment Files

Each microservice needs its own `.env` file:

```bash
# User Service
cp services/user-service/.env.example services/user-service/.env

# Product Service
cp services/product-service/.env.example services/product-service/.env

# Order Service
cp services/order-service/.env.example services/order-service/.env

# Payment Service
cp services/payment-service/.env.example services/payment-service/.env

# Notification Service
cp services/notification-service/.env.example services/notification-service/.env
```

### 3. Customize Credentials (Production)

For production environments, update the passwords in:
- Root `.env` (for Docker Compose databases)
- Each service's `.env` file (must match root `.env`)

**Example:**
```bash
# Root .env
USER_DB_PASSWORD=super_secure_random_password_123

# services/user-service/.env
DB_PASSWORD=super_secure_random_password_123  # Must match!
```

---

## Environment Variable Structure

### Root `.env` (Docker Compose)
Controls database containers:
```env
USER_DB_NAME=user_db
USER_DB_USER=user_service
USER_DB_PASSWORD=your_password_here
USER_DB_PORT=5433
```

### Service `.env` Files
Control NestJS application configuration:
```env
NODE_ENV=development
PORT=3001
GRPC_PORT=5001

DB_HOST=localhost
DB_PORT=5433
DB_USER=user_service
DB_PASSWORD=your_password_here  # Must match root .env!
DB_NAME=user_db
```

---

## Starting Services

### Option 1: Docker Compose Only (Databases)
```bash
docker-compose up -d
```

This starts only the PostgreSQL databases.

### Option 2: Full Stack (Databases + Services)
```bash
# Start databases
docker-compose up -d

# In separate terminals, run each service:
cd services/user-service && npm run start:dev
cd services/product-service && npm run start:dev
cd services/order-service && npm run start:dev
cd services/payment-service && npm run start:dev
cd services/notification-service && npm run start:dev
```

---

## Running Migrations

Each service has migration commands:

```bash
# User Service
cd services/user-service
npm run migration:run

# Product Service
cd services/product-service
npm run migration:run

# (Repeat for other services...)
```

---

## Security Best Practices

1. ✅ **Never commit `.env` files** - Already configured in `.gitignore`
2. ✅ **Use strong passwords in production** - Change default passwords
3. ✅ **Keep `.env.example` updated** - But without real credentials
4. ✅ **Use secrets management in production** - AWS Secrets Manager, Vault, etc.
5. ✅ **Rotate credentials regularly** - Especially in production

---

## Troubleshooting

### Error: "Connection refused" or "ECONNREFUSED"
- Check if databases are running: `docker-compose ps`
- Verify ports in `.env` match `docker-compose.yml`
- Ensure `DB_HOST=localhost` (or `user-db` if service is containerized)

### Error: "password authentication failed"
- Verify passwords match between root `.env` and service `.env` files
- Check database user has correct permissions

### Error: "database does not exist"
- Run migrations: `npm run migration:run`
- Check database name in `.env` files
