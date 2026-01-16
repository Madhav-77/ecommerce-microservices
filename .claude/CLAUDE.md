# E-Commerce Microservices Project Memory

This is a **learning project** demonstrating a complete microservices architecture with NestJS, gRPC, GraphQL, PostgreSQL, and Docker.

## Project Context

You are working in a microservices monorepo with:

- **5 NestJS microservices**: User, Product, Order, Payment, Notification
- **Communication**: gRPC for inter-service, GraphQL for client-gateway
- **Databases**: PostgreSQL (database-per-service pattern)
- **Infrastructure**: Docker Compose, NPM workspaces
- **Frontend**: React 18 + TypeScript + Vite (in apps/client)

## Service Architecture

```
Client (React) → API Gateway (GraphQL) → Microservices (gRPC) → PostgreSQL DBs
```

Each service:
- Has its own database (ports 5433-5437)
- Exposes HTTP (3001-3005) and gRPC (5001-5005) ports
- Uses TypeORM with migrations
- Is independently deployable

## Import Project Rules

@.claude/rules/architecture.md
@.claude/rules/database.md
@.claude/rules/security.md
@.claude/rules/development.md

## Quick Reference

**Start everything**: `npm run dev:all`
**Database**: `npm run db:up` / `db:down`
**Migrations**: `npm run migration:run:all`

See README.md, COMMANDS.md, and START.md for detailed documentation.

## Updating This File

When implementing new features or making significant changes:

1. Update relevant rule files in `.claude/rules/`
2. Add new patterns or conventions discovered
3. Document architectural decisions
4. Keep the team synchronized by committing updates

This ensures all team members have consistent Claude Code context when they clone the repo.
