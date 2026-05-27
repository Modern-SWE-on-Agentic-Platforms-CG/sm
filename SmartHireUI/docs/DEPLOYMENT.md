# Deployment Guide

**Last Updated**: May 26, 2026

## Overview

SmartHire Web Platform can be deployed to various environments (development, staging, production). This guide covers build optimization, containerization, environment configuration, and deployment strategies.

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 8+
- Docker (for containerized deployment)
- Access to deployment environment (AWS/GCP/Azure)
- Environment variables configured

## Environment Configuration

### Environment Variables

Create `.env` files for each environment:

**`.env.development`** (local development)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=smarthire-dev
VITE_KEYCLOAK_CLIENT_ID=smarthire-client-dev
VITE_APP_ENV=development
```

**`.env.staging`** (staging environment)
```bash
VITE_API_URL=https://api-staging.smarthire.com/api
VITE_KEYCLOAK_URL=https://auth-staging.smarthire.com
VITE_KEYCLOAK_REALM=smarthire-staging
VITE_KEYCLOAK_CLIENT_ID=smarthire-client-staging
VITE_APP_ENV=staging
VITE_ANALYTICS_ENABLED=true
```

**`.env.production`** (production environment)
```bash
VITE_API_URL=https://api.smarthire.com/api
VITE_KEYCLOAK_URL=https://auth.smarthire.com
VITE_KEYCLOAK_REALM=smarthire
VITE_KEYCLOAK_CLIENT_ID=smarthire-client
VITE_APP_ENV=production
VITE_ANALYTICS_ENABLED=true
VITE_SENTRY_DSN=https://key@sentry.io/project
```

### Build Environment Variables

Load environment file before build:

```bash
# Development
npm run build -- --mode development

# Staging
npm run build -- --mode staging

# Production
npm run build -- --mode production
```

## Build Optimization

### Development Build

```bash
cd app
npm install
npm run build
```

**Output**: `app/dist/` directory (~500KB gzipped)

### Production Build

```bash
# Install dependencies
npm ci  # Use npm ci instead of npm install for reproducible builds

# Build with optimization
npm run build

# Generate bundle analysis
npm run analyze-bundle

# Check bundle size
du -sh dist/
```

**Build Optimization Checklist**:
- ✓ Tree-shaking enabled (Rollup default)
- ✓ Code splitting per route (lazy-loaded)
- ✓ Minification with esbuild
- ✓ Gzip compression enabled
- ✓ Source maps excluded from production
- ✓ React DevTools excluded

### Production Vite Config

**File**: `app/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['redux', '@reduxjs/toolkit'],
          'ui-vendor': ['recharts', 'react-big-calendar'],
        },
      },
    },
  },
})
```

## Docker Containerization

### Dockerfile

**File**: `Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY app/ .

# Build application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install serve to run static server
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist /app/dist

# Expose port
EXPOSE 3000

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Building Docker Image

```bash
# Build image
docker build -t smarthire-web:latest .

# Build with specific tag
docker build -t smarthire-web:v1.0.0 \
  --build-arg VITE_API_URL=https://api.smarthire.com/api \
  .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_URL=https://api.smarthire.com/api \
  smarthire-web:latest

# Push to registry
docker tag smarthire-web:latest gcr.io/project/smarthire-web:latest
docker push gcr.io/project/smarthire-web:latest
```

### Docker Compose (Development)

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://api:3001/api
      VITE_KEYCLOAK_URL: http://keycloak:8080
    depends_on:
      - api
      - keycloak

  api:
    image: smarthire-api:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/smarthire

  keycloak:
    image: jboss/keycloak:latest
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_USER: admin
      KEYCLOAK_PASSWORD: admin

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: smarthire
```

## Cloud Deployment

### AWS S3 + CloudFront

```bash
# Build production bundle
npm run build

# Upload to S3
aws s3 sync dist/ s3://smarthire-web-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123ABCD \
  --paths "/*"
```

### Google Cloud Run

```bash
# Build and push to GCR
docker build -t gcr.io/smarthire-prod/web:latest .
docker push gcr.io/smarthire-prod/web:latest

# Deploy to Cloud Run
gcloud run deploy smarthire-web \
  --image gcr.io/smarthire-prod/web:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars VITE_API_URL=https://api.smarthire.com/api
```

### Kubernetes Deployment

**File**: `k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smarthire-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smarthire-web
  template:
    metadata:
      labels:
        app: smarthire-web
    spec:
      containers:
      - name: web
        image: gcr.io/smarthire-prod/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_URL
          value: "https://api.smarthire.com/api"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Performance Optimization

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli@latest

# Run audit
lhci autorun

# Target metrics:
# - Largest Contentful Paint (LCP): < 2.5s
# - First Input Delay (FID): < 100ms
# - Cumulative Layout Shift (CLS): < 0.1
# - Time to Interactive (TTI): < 3.8s
```

### Caching Strategy

**File**: `.htaccess` (Apache) or `vercel.json` (Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### CDN Configuration

```bash
# Enable gzip compression
Accept-Encoding: gzip, deflate, br

# Set cache headers
Cache-Control: public, max-age=31536000, immutable

# Set security headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

## Monitoring & Logging

### Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
})
```

### Application Monitoring

```bash
# Datadog
npm install @datadog/browser-rum

# New Relic
npm install @newrelic/browser-agent
```

### Log Aggregation

```typescript
// All logs sent to centralized service
import { Logger } from '@services/logger'

const logger = new Logger('ComponentName')
logger.info('User logged in', { userId: user.id })
logger.error('API failed', { error, endpoint: '/candidates' })
```

## CI/CD Pipeline

### GitHub Actions

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci --prefix app
    
    - name: Run tests
      run: npm run test --prefix app
    
    - name: Build
      run: npm run build --prefix app
    
    - name: Deploy to Production
      run: |
        aws s3 sync app/dist s3://smarthire-prod/
        aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*"
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] Tests pass (unit, integration, E2E)
- [ ] Bundle size reviewed (< 500KB gzipped)
- [ ] Lighthouse audit score ≥ 90
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] SSL certificate valid
- [ ] Database migrations completed
- [ ] Analytics initialized
- [ ] Error tracking enabled
- [ ] Rollback plan in place

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version
aws s3 sync s3://smarthire-prod-backup/ s3://smarthire-prod/
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/*"

# Or with Docker
docker run -p 3000:3000 smarthire-web:v1.0.0

# Or with Kubernetes
kubectl rollout undo deployment/smarthire-web
```

## Security Checklist

- [ ] Environment variables never committed
- [ ] API keys stored in secrets manager
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] CORS whitelist configured
- [ ] Dependencies audited (npm audit)
- [ ] No sensitive data in logs
- [ ] Rate limiting enabled
- [ ] DDoS protection enabled
- [ ] Regular security patches applied

## Troubleshooting

**Issue**: Build fails with out of memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Issue**: Deployment takes too long
```bash
# Use npm ci instead of npm install
npm ci --prefix app

# Cache dependencies
npm cache clean --force
```

**Issue**: API calls failing in production
```bash
# Check CORS headers
curl -I https://api.smarthire.com/api

# Check environment variables
console.log(import.meta.env.VITE_API_URL)
```

---

For production support, see [Monitoring & Alerting Guide](./MONITORING.md) and [Security Best Practices](./SECURITY.md).
