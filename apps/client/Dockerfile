# Multi-stage build for React + Vite Client
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build-time environment variables
ARG VITE_GATEWAY_URL=http://localhost:4000/graphql
ARG VITE_WS_GATEWAY_URL=ws://localhost:4000/graphql

# Set them as environment variables for the build
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
ENV VITE_WS_GATEWAY_URL=$VITE_WS_GATEWAY_URL

# Copy package files
COPY apps/client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/client ./

# Build the production bundle (Vite will use VITE_* env vars)
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (for SPA routing)
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Nginx starts automatically with CMD ["nginx", "-g", "daemon off;"]
