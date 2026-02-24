FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose gRPC port (only 5001 needed for gRPC communication)
EXPOSE 5001

# Health check (TCP check for gRPC port)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('net').connect(5001, 'localhost').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/main.js"]
