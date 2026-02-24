# Multi-stage build for NestJS Gateway
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY apps/gateway/package*.json ./apps/gateway/
COPY libs/proto/package*.json ./libs/proto/

# Install dependencies (all workspaces)
RUN npm ci

# Copy source code
COPY apps/gateway ./apps/gateway
COPY libs/proto ./libs/proto

# Build the gateway app
RUN npm run build:gateway

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/gateway/package*.json ./apps/gateway/

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder /app/apps/gateway/src/schema.gql ./apps/gateway/src/

# Copy proto files (needed at runtime for gRPC)
COPY --from=builder /app/libs/proto ./libs/proto

# Expose Gateway port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the gateway
CMD ["node", "apps/gateway/dist/main.js"]
