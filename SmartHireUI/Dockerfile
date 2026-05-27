# Multi-stage Dockerfile for SmartHire Web Platform
# Build stage: Node.js 18 for build
# Runtime stage: Nginx for serving optimized React SPA

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY app/. .

# Build production bundle
RUN npm run build

# Runtime stage: Nginx
FROM nginx:1.27-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY .docker/nginx.conf /etc/nginx/nginx.conf
COPY .docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -S nginx-user && adduser -S nginx-user -G nginx-user
USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/index.html || exit 1

# Expose port 8080 (non-privileged)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
