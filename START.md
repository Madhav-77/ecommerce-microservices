# Quick Start Guide

This guide will help you start all services locally.

**NEW:** All commands can now be run from the root directory! See [COMMANDS.md](./COMMANDS.md) for full reference.

## Prerequisites

- Docker Desktop running
- Node.js installed
- Terminal access

---

## 🚀 Super Quick Start (Recommended)

```bash
# From root directory - does everything!
npm run setup

# Then start all services
npm run dev:all
```

That's it! Everything runs in one terminal with colored logs.

---

## Step-by-Step Start (Alternative)

### Step 1: Start Databases

```bash
npm run db:up
```

**Verify databases are running:**
```bash
npm run db:ps
```

You should see 5 PostgreSQL containers running.

---

### Step 2: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for client and all services.

---

### Step 3: Run Database Migrations

```bash
npm run migration:run:all
```

This runs migrations for all 5 services.

---

### Step 4: Start All Services

**Option A: All in One Terminal (Recommended)**
```bash
npm run dev:all
```
Starts all 5 services + client with color-coded logs!

**Option B: Separate Terminals**

Terminal 1 - User Service:
```bash
npm run dev:user
```

Terminal 2 - Product Service:
```bash
npm run dev:product
```

Terminal 3 - Order Service:
```bash
npm run dev:order
```

Terminal 4 - Payment Service:
```bash
npm run dev:payment
```

Terminal 5 - Notification Service:
```bash
npm run dev:notification
```

Terminal 6 - Client:
```bash
npm run dev:client
```

---

## Access the Application

- **Client:** http://localhost:3000
- **User Service:** http://localhost:3001
- **Product Service:** http://localhost:3002
- **Order Service:** http://localhost:3003
- **Payment Service:** http://localhost:3004
- **Notification Service:** http://localhost:3005

---

## Verify Everything is Running

### Check Databases
```bash
npm run db:ps
```

### Check User Service
```bash
curl http://localhost:3001
```

### View All Logs
```bash
npm run db:logs
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check if databases are running
npm run db:ps

# Restart databases
npm run db:down
npm run db:up

# Check logs
npm run db:logs
```

### Migration Failed
```bash
# Check database is accessible
psql -h localhost -p 5433 -U user_service -d user_db

# If password prompt: user_password

# Rebuild service
cd services/user-service
npm run build
npm run migration:run
```

### Service Won't Start
```bash
# Clean and reinstall
npm run clean
npm run install:all

# Rebuild
npm run build:all
```

---

## Stop Everything

### Stop All Services
Press `Ctrl+C` in the terminal running `npm run dev:all`

### Stop Databases
```bash
npm run db:down
```

---

## Development Workflow

**Typical startup order:**
1. Start databases (once per day)
2. Run migrations (after schema changes)
3. Start backend services (each time you code)
4. Start client (each time you code)

**Hot reload is enabled** - code changes auto-refresh!

---

## 📚 More Commands

See [COMMANDS.md](./COMMANDS.md) for complete command reference including:
- Individual service commands
- Docker commands
- Build commands
- Clean commands
- And more!
