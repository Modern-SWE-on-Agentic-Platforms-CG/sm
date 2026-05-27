# SmartHire Production Deployment Guide

**Status**: Phase 15 Final Integration & Deployment  
**Last Updated**: May 26, 2026  
**Version**: 1.0

---

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Local Development Setup](#local-development-setup)
4. [Build & Containerization](#build--containerization)
5. [Staging Environment](#staging-environment)
6. [Production Deployment](#production-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Deployment Architecture

### Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN / CloudFront                        │
│            (Caching, Global Distribution)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (ALB/LB)                    │
│         (SSL/TLS termination, traffic routing)               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Kubernetes / Container Orchestration            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Pod 1      │  │   Pod 2      │  │   Pod N      │       │
│  │  Nginx+App   │  │  Nginx+App   │  │  Nginx+App   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│    (Auto-scaling, Health checks, Rolling updates)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              External Services (via API)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Keycloak │  │ SmartHire│  │  S3 /    │  │ Monitoring
 │  │   SSO    │  │   API    │  │ Storage  │  │   (DataDog)   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Environments

| Environment | Purpose | Instance Count | Region | SSL |
|-------------|---------|-----------------|--------|-----|
| **Development** | Local testing | 1 (local) | localhost | No |
| **Staging** | UAT & testing | 1-2 | AWS us-east-1 | Yes |
| **Production** | Live users | 3+ | AWS multi-region | Yes |

---

## Pre-Deployment Checklist

### Security Requirements

- [ ] All environment secrets configured in deployment system
- [ ] SSL/TLS certificates valid and non-expired
- [ ] API keys and tokens properly rotated
- [ ] Security audit completed (T218)
- [ ] Dependency vulnerabilities scanned (`npm audit`)
- [ ] CORS headers properly configured
- [ ] HTTPS enforced on all endpoints

### Application Requirements

- [ ] Unit tests passing (>80% coverage)
- [ ] E2E tests passing across Chrome, Firefox, Safari (T214-T217)
- [ ] Performance benchmarks met (FCP <2s, TTI <3s)
- [ ] Bundle size optimized (<150KB gzip initial)
- [ ] Build succeeds without errors
- [ ] No console errors in production build
- [ ] All feature flags properly configured

### Infrastructure Requirements

- [ ] Docker image builds successfully
- [ ] Load balancer health checks configured
- [ ] Auto-scaling policies defined
- [ ] Monitoring and alerting active
- [ ] Log aggregation configured
- [ ] CDN cache settings verified
- [ ] Database backups scheduled
- [ ] Disaster recovery plan documented

### Documentation Requirements

- [ ] Deployment guide reviewed and up-to-date
- [ ] Runbook for common issues prepared
- [ ] Team trained on deployment process
- [ ] Rollback procedure tested
- [ ] Communication plan for deployment window

---

## Local Development Setup

### Prerequisites

```bash
# Node.js 18+ and npm 8+
node --version    # v18.x or higher
npm --version     # 8.x or higher

# Docker and Docker Compose
docker --version     # 20.10+
docker-compose --version  # 2.0+

# Optional: kubectl for Kubernetes debugging
kubectl version --client
```

### Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/company/smarthire.git
cd smarthire

# 2. Create .env file from template
cp app/.env.example app/.env

# 3. Configure for local development
cat app/.env
# VITE_API_BASE_URL=http://localhost:3000
# VITE_KEYCLOAK_URL=http://localhost:8080
# VITE_ENABLE_MOCK_DATA=true

# 4. Install dependencies
cd app
npm install

# 5. Start development server
npm run dev

# 6. Visit http://localhost:5173
```

### Docker Development

```bash
# Build image locally
docker build -t smarthire:dev .

# Run with docker-compose
docker-compose up

# Access at http://localhost:8080
```

---

## Build & Containerization

### Production Build Process

#### Step 1: Local Build Verification

```bash
cd app

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Output: dist/ directory with optimized bundles
ls -lh dist/
# dist/index.html (3.2 KB)
# dist/assets/react-vendor-*.js (~80 KB gzip)
# dist/assets/charts-*.js (~116 KB gzip)
# dist/assets/index-*.js (~10 KB gzip)
```

**Expected Output**:
- Build time: 9-15 seconds
- Bundle size: 500 KB uncompressed, ~108 KB gzipped (initial)
- No TypeScript errors
- No ESLint errors

#### Step 2: Docker Image Build

```bash
# Build with specific tag
docker build -t smarthire:1.0.0 .

# Or with build-time environment
docker build \
  --build-arg NODE_ENV=production \
  -t smarthire:1.0.0 \
  .

# Verify image
docker images | grep smarthire
# smarthire   1.0.0      abc123def456    500MB    1 hour ago
```

**Build stages**:
1. Node build stage: ~600 MB (includes node_modules)
2. Nginx runtime stage: ~50 MB (only artifacts)
3. Final image: ~500 MB

#### Step 3: Image Registry Push

```bash
# Login to registry
docker login -u username -p password registry.example.com

# Tag image
docker tag smarthire:1.0.0 registry.example.com/smarthire:1.0.0
docker tag smarthire:1.0.0 registry.example.com/smarthire:latest

# Push to registry
docker push registry.example.com/smarthire:1.0.0
docker push registry.example.com/smarthire:latest

# Verify
docker pull registry.example.com/smarthire:1.0.0
```

---

## Staging Environment

### Staging Deployment

#### Option 1: Netlify Deployment (Recommended for Early-Stage)

```bash
# Prerequisites: Netlify account, site created

# Deploy
netlify deploy --prod --dir app/dist --auth=$NETLIFY_AUTH_TOKEN

# Output
# Deploy draft URL: https://branch--site.netlify.app
# Live URL: https://staging.smarthire.example.com
```

#### Option 2: Kubernetes Deployment

```bash
# Prerequisites: kubectl configured, cluster access

# Create namespace
kubectl create namespace staging

# Apply configuration
kubectl apply -f k8s/staging/ -n staging

# Verify deployment
kubectl get pods -n staging
kubectl logs -f deployment/smarthire -n staging

# Port forward for testing
kubectl port-forward svc/smarthire 8080:8080 -n staging
```

#### Option 3: AWS ECS Deployment

```bash
# Prerequisites: AWS CLI configured, ECR repository

# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag smarthire:1.0.0 123456789.dkr.ecr.us-east-1.amazonaws.com/smarthire:1.0.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/smarthire:1.0.0

# Update ECS service
aws ecs update-service \
  --cluster staging \
  --service smarthire \
  --force-new-deployment \
  --region us-east-1

# Monitor deployment
aws ecs describe-services --cluster staging --services smarthire --region us-east-1
```

### Staging Verification

```bash
# 1. Smoke tests
curl https://staging.smarthire.example.com/health

# 2. Browser testing
# Visit: https://staging.smarthire.example.com
# Login with test credentials
# Verify all user stories work

# 3. Performance check
# Run Lighthouse: https://web.dev/measure/
# Target: FCP <2s, LCP <2.5s, CLS <0.1

# 4. Security check
# OWASP ZAP scan
# SSL Labs test: https://www.ssllabs.com/
```

---

## Production Deployment

### Pre-Production Checks

```bash
# 1. Security audit
npm audit

# 2. Dependency update check
npm outdated

# 3. Build verification
npm run build
du -sh app/dist/

# 4. Performance benchmark
npm run build -- --sourcemap=true
npm run preview

# Visit http://localhost:4173 and run Lighthouse audit

# 5. E2E tests on production code
npm run test:e2e -- --headed
```

### Production Rollout Strategy

#### Canary Deployment (Recommended)

```
Phase 1: Deploy to 10% of users
  → Monitor for 30 minutes
  → Check error rates, performance

Phase 2: Deploy to 50% of users
  → Monitor for 1 hour
  → Verify all metrics healthy

Phase 3: Deploy to 100% of users
  → Full deployment
  → Continue monitoring
```

#### Blue-Green Deployment (Alternative)

```
Blue:   Currently active (v1.0.0)
Green:  New deployment (v1.1.0)

1. Deploy to Green
2. Run smoke tests on Green
3. Switch load balancer from Blue → Green
4. Keep Blue ready for quick rollback
5. After 24h of stable operation, retire Blue
```

#### Rolling Deployment (Fastest)

```
1. Update 1 pod → restart → health check pass
2. Update next pod → repeat
3. Continue until all pods updated
4. Verify metrics throughout
```

### Production Deployment Commands

```bash
# Option 1: Kubernetes
kubectl set image deployment/smarthire \
  smarthire=registry.example.com/smarthire:1.0.0 \
  -n production

# Wait for rollout
kubectl rollout status deployment/smarthire -n production

# Option 2: AWS ECS
aws ecs update-service \
  --cluster production \
  --service smarthire \
  --force-new-deployment \
  --region us-east-1

# Option 3: Netlify
netlify deploy --prod --dir app/dist --auth=$NETLIFY_AUTH_TOKEN
```

### Post-Deployment Verification

```bash
# 1. Health checks
curl https://smarthire.example.com/health

# 2. Smoke tests (manual or automated)
# - Login flow
# - Candidate pipeline view
# - Create candidate
# - Schedule interview
# - Submit feedback

# 3. Performance monitoring
# - Check Core Web Vitals
# - Monitor error rate
# - Verify API response times

# 4. User reporting
# - Social media monitoring
# - Support ticket tracking
# - Stakeholder notification
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Build & Test (`build-test.yml`)

**Trigger**: Push to main/develop, PR

**Jobs**:
- Lint code
- Type check
- Run unit tests
- Build application
- Build Docker image

**Artifacts**: app-dist (retained 1 day)

#### 2. E2E Tests (`e2e-tests.yml`)

**Trigger**: Push to main/develop, Daily schedule (2 AM UTC)

**Jobs** (parallel):
- Run Playwright tests - Chromium
- Run Playwright tests - Firefox
- Run Playwright tests - Safari
- Publish results

**Artifacts**: test results, videos (retained 7 days)

#### 3. Deploy (`deploy.yml`)

**Trigger**: Push to main/develop, Manual dispatch

**Jobs**:
- Deploy to staging (develop branch)
- Deploy to production (main branch)
- Notify Slack on success

### Environment Secrets Required

```
# Docker Registry
DOCKER_USERNAME
DOCKER_PASSWORD
DOCKER_REGISTRY

# Deployment
NETLIFY_AUTH_TOKEN
NETLIFY_STAGING_SITE_ID
NETLIFY_PRODUCTION_SITE_ID

# Environment URLs
STAGING_API_URL
PRODUCTION_API_URL

# Notifications
SLACK_WEBHOOK
```

### CI/CD Status Dashboard

View at: `https://github.com/company/smarthire/actions`

---

## Monitoring & Logging

### Application Monitoring

```
Datadog / New Relic / AWS CloudWatch

Metrics to track:
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Page load time
- Resource utilization (CPU, Memory)
```

### Log Aggregation

```
ELK Stack / CloudWatch / Datadog

Log levels:
- ERROR: Application errors, exceptions
- WARN: Deprecations, unusual conditions
- INFO: Important lifecycle events
- DEBUG: Detailed application state
```

### Alerting

```
Alert on:
- Error rate > 1%
- Latency p95 > 2000ms
- Service down for > 5 minutes
- Certificate expiry < 7 days
```

---

## Rollback Procedures

### Emergency Rollback (< 5 minutes)

```bash
# Option 1: Kubernetes
kubectl rollout undo deployment/smarthire -n production

# Option 2: AWS ECS
aws ecs update-service \
  --cluster production \
  --service smarthire \
  --task-definition smarthire:42 \
  --region us-east-1

# Option 3: Netlify
netlify rollback
```

### Verification After Rollback

```bash
# 1. Health check
curl https://smarthire.example.com/health

# 2. Verify version
curl https://smarthire.example.com/api/version

# 3. Monitor metrics
# Check dashboards for errors/latency returning to normal
```

---

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# 1. Check Node version
node --version

# 2. Clear cache
rm -rf node_modules package-lock.json
npm install

# 3. Check TypeScript
npm run type-check

# 4. Check disk space
df -h

# 5. Rebuild
npm run build
```

#### Docker Image Won't Build

```bash
# 1. Check Dockerfile syntax
docker build --dry-run .

# 2. Check base image availability
docker pull node:18-alpine
docker pull nginx:1.27-alpine

# 3. Verify context size
du -sh .

# 4. Try with buildkit
DOCKER_BUILDKIT=1 docker build .
```

#### Deployment Fails

```bash
# 1. Verify credentials
echo $GITHUB_TOKEN | wc -c  # Should be > 30 chars

# 2. Check permissions
kubectl auth can-i create deployments -n production

# 3. Inspect latest pod
kubectl describe pod -n production

# 4. Check logs
kubectl logs -f deployment/smarthire -n production
```

#### Application Errors in Production

```bash
# 1. Check error logs
kubectl logs -f deployment/smarthire -n production

# 2. Inspect Nginx logs
kubectl exec -it pod/smarthire-xxx -n production -- tail -f /var/log/nginx/error.log

# 3. Verify environment variables
kubectl exec -it pod/smarthire-xxx -n production -- printenv

# 4. Check health endpoint
curl -v https://smarthire.example.com/health
```

---

## Deployment Checklist

### Pre-Deployment (1 hour before)

- [ ] Notify team in Slack #deployments channel
- [ ] Verify all tests passing
- [ ] Confirm staging deployment success
- [ ] Review release notes
- [ ] Backup database

### During Deployment (15-30 minutes)

- [ ] Monitor CI/CD pipeline
- [ ] Check deployment metrics
- [ ] Watch error logs
- [ ] Verify smoke tests pass
- [ ] Confirm with stakeholders

### Post-Deployment (1 hour after)

- [ ] Monitor application metrics
- [ ] Check error tracking systems
- [ ] Verify user feedback channels
- [ ] Update deployment status
- [ ] Document any issues

---

## Deployment Schedule

| Environment | Frequency | Timing | Owner |
|-------------|-----------|--------|-------|
| **Staging** | Daily | 10:00 AM (develop) | DevOps |
| **Production** | Weekly | Tuesday 10:00 AM | DevOps + QA |
| **Hotfix** | On-demand | ASAP | DevOps Lead |

---

## Support & Escalation

### Support Contacts

| Issue | Contact | Escalation |
|-------|---------|-----------|
| Build failure | DevOps team | Engineering Lead |
| Performance issue | DevOps + Backend | CTO |
| Security incident | Security team | CISO |
| Data loss | Database team | CEO |

---

**Last Updated**: May 26, 2026  
**Next Review**: June 26, 2026
