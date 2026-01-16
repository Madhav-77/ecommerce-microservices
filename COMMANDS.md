# NPM Commands Reference

All commands can be run from the **root directory**.

---

## 🚀 Quick Start (First Time Setup)

```bash
# Complete setup: install deps, start DBs, run migrations
npm run setup
```

This runs:
1. `npm run install:all` - Installs all dependencies
2. `npm run db:up` - Starts all databases
3. `npm run migration:run:all` - Runs all migrations

---

## 📦 Installation Commands

### Install Everything
```bash
npm run install:all
```

### Install Individual Parts
```bash
npm run install:client        # Client only
npm run install:services      # All services
npm run install:user          # User service only
npm run install:product       # Product service only
npm run install:order         # Order service only
npm run install:payment       # Payment service only
npm run install:notification  # Notification service only
```

---

## 🗄️ Database Commands

### Start Databases
```bash
npm run db:up
```
Starts all 5 PostgreSQL databases in Docker.

### Stop Databases
```bash
npm run db:down
```
Stops and removes all database containers.

### View Database Status
```bash
npm run db:ps
```
Shows which databases are running.

### View Database Logs
```bash
npm run db:logs
```
Shows real-time logs from all databases.

---

## 🔄 Migration Commands

### Run All Migrations
```bash
npm run migration:run:all
```
Runs migrations for all 5 services.

### Run Individual Migrations
```bash
npm run migration:run:user
npm run migration:run:product
npm run migration:run:order
npm run migration:run:payment
npm run migration:run:notification
```

### Rollback All Migrations
```bash
npm run migration:rollback:all
```

### Rollback Individual Migrations
```bash
npm run migration:rollback:user
npm run migration:rollback:product
npm run migration:rollback:order
npm run migration:rollback:payment
npm run migration:rollback:notification
```

---

## 🏃 Development Commands

### Start Everything (All Services + Client)
```bash
npm run dev:all
```
**Runs in one terminal with colored output!**
- User service (blue)
- Product service (green)
- Order service (yellow)
- Payment service (magenta)
- Notification service (cyan)
- Client (white)

### Start All Backend Services Only
```bash
npm run dev:services
```
Starts all 5 backend services (no client).

### Start Individual Services
```bash
npm run dev:client         # Client (port 3000)
npm run dev:user           # User service (port 3001)
npm run dev:product        # Product service (port 3002)
npm run dev:order          # Order service (port 3003)
npm run dev:payment        # Payment service (port 3004)
npm run dev:notification   # Notification service (port 3005)
```

---

## 🏗️ Build Commands

### Build Everything
```bash
npm run build:all
```

### Build Individual Parts
```bash
npm run build:client
npm run build:services      # All services
npm run build:user
npm run build:product
npm run build:order
npm run build:payment
npm run build:notification
```

---

## 🐳 Docker Commands

### Build All Docker Images
```bash
npm run docker:build
```

### Start All Containers (DBs + Services)
```bash
npm run docker:up
```

### Stop All Containers
```bash
npm run docker:down
```

### View Container Status
```bash
npm run docker:ps
```

### View Container Logs
```bash
npm run docker:logs
```

---

## 🧹 Cleanup Commands

### Clean All node_modules and dist
```bash
npm run clean
```

### Clean Individual Parts
```bash
npm run clean:client
npm run clean:services
```

---

## 📋 Common Workflows

### Starting Development (Daily)
```bash
# 1. Start databases
npm run db:up

# 2. Start all services in one terminal
npm run dev:all

# OR start in separate terminals:
npm run dev:user
npm run dev:product
# ... etc
```

### After Pulling Latest Code
```bash
# Reinstall dependencies
npm run install:all

# Run new migrations
npm run migration:run:all
```

### Clean Slate (Nuclear Option)
```bash
# Clean everything
npm run clean

# Stop all containers
npm run docker:down

# Start fresh
npm run setup
```

### Running Migrations After Schema Changes
```bash
# For specific service
npm run migration:run:user

# For all services
npm run migration:run:all
```

### Debugging Individual Service
```bash
# Start only the service you're working on
npm run dev:user

# In another terminal, check database
npm run db:logs
```

---

## 🎯 Recommended Workflow

### Option 1: All Services in One Terminal
```bash
# Terminal 1: Start DBs
npm run db:up

# Terminal 2: Start everything
npm run dev:all
```

### Option 2: Separate Terminals (Better for Debugging)
```bash
# Terminal 1: Databases
npm run db:up

# Terminal 2: User Service
npm run dev:user

# Terminal 3: Product Service
npm run dev:product

# Terminal 4: Order Service
npm run dev:order

# Terminal 5: Payment Service
npm run dev:payment

# Terminal 6: Notification Service
npm run dev:notification

# Terminal 7: Client
npm run dev:client
```

---

## 🆘 Troubleshooting Commands

### Check if databases are running
```bash
npm run db:ps
```

### View database logs
```bash
npm run db:logs
```

### Restart databases
```bash
npm run db:down
npm run db:up
```

### Rebuild everything
```bash
npm run clean
npm run install:all
npm run build:all
```

### Check specific service is running
```bash
# After running npm run dev:user
curl http://localhost:3001
```

---

## 📊 Port Reference

| Service | HTTP Port | gRPC Port | DB Port |
|---------|-----------|-----------|---------|
| Client | 3000 | - | - |
| User Service | 3001 | 5001 | 5433 |
| Product Service | 3002 | 5002 | 5434 |
| Order Service | 3003 | 5003 | 5435 |
| Payment Service | 3004 | 5004 | 5436 |
| Notification Service | 3005 | 5005 | 5437 |

---

## 💡 Pro Tips

### Use `dev:all` for quick testing
```bash
npm run dev:all
```
All services start with color-coded logs in one terminal!

### Use individual commands for debugging
```bash
npm run dev:user  # Only start what you're working on
```

### Always start databases first
```bash
npm run db:up
```

### Check database status before running services
```bash
npm run db:ps
```

### Run setup once on first clone
```bash
npm run setup
```
This does everything: install, start DBs, run migrations!

---

## 🔄 Complete Development Cycle

```bash
# 1. First time setup
npm run setup

# 2. Start development
npm run dev:all

# 3. Make code changes (hot reload works!)

# 4. When done
# Press Ctrl+C to stop services
npm run db:down  # Stop databases
```
