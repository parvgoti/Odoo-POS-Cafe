---
name: devops-mastery
description: >
  Comprehensive DevOps & Deployment skill covering Docker containerization, CI/CD pipelines
  (GitHub Actions, GitLab CI), cloud deployment (AWS, GCP, Fly.io, Railway, Vercel, Coolify),
  reverse proxies (Nginx, Caddy, Traefik), monitoring (Prometheus, Grafana, Sentry),
  logging (structured logs, log aggregation), security hardening, SSL/TLS, environment
  management, zero-downtime deployments, infrastructure as code, server provisioning,
  and production operations. Use when deploying, scaling, monitoring, or operating any
  application in production. Covers 2026 best practices.
---

# DevOps & Deployment Mastery Skill

A complete, battle-tested guide for shipping applications to production, keeping them
running, and scaling them reliably. This skill covers the full lifecycle from local
development to production operations.

---

## When to Use This Skill

- **Containerizing** an application with Docker (Node.js, Python, Go, etc.)
- Setting up **CI/CD pipelines** (GitHub Actions, GitLab CI, etc.)
- **Deploying** to cloud platforms (AWS, GCP, Fly.io, Railway, Vercel, VPS)
- Configuring **reverse proxies** (Nginx, Caddy, Traefik)
- Setting up **SSL/TLS certificates** (Let's Encrypt, Cloudflare)
- Implementing **monitoring and alerting** (Prometheus, Grafana, Sentry)
- Configuring **logging and log aggregation** (structured logging, ELK)
- **Scaling** applications (horizontal, vertical, auto-scaling)
- Implementing **zero-downtime deployments** (blue-green, rolling, canary)
- Managing **environment variables and secrets**
- Setting up **database backups and disaster recovery**
- **Security hardening** servers and containers
- Managing **DNS, domains, and CDN** (Cloudflare, Route 53)

---

## Core DevOps Principles

### 1. Infrastructure as Code (IaC)
Every piece of infrastructure MUST be defined in version-controlled configuration files.
No manual server configuration. If the server dies, you can rebuild it from code.

### 2. Immutable Deployments
Never modify running containers. Build a new image → deploy → destroy old.
Configuration changes = new deployment.

### 3. Environment Parity
Development, staging, and production should be as similar as possible.
Same Docker images, same database engines, same configurations (with different secrets).

### 4. Fail Fast, Recover Faster
Design for failure. Every service will go down. Plan for:
- Health checks that detect failures in seconds
- Auto-restart on crash (process managers, container orchestrators)
- Rollback capability within minutes
- Backups tested regularly

### 5. Least Privilege
Every service, container, and user gets minimum permissions required.
No root containers. No wildcard IAM policies. No shared credentials.

### 6. Defense in Depth
Multiple security layers: firewall → reverse proxy → application → database.
If one layer fails, the next one catches it.

### 7. Observable Systems
If you can't measure it, you can't manage it. Every production system needs:
- **Metrics**: CPU, memory, request rate, error rate, latency
- **Logs**: Structured JSON logs with request IDs for tracing
- **Traces**: Distributed tracing for microservices
- **Alerts**: PagerDuty/Slack notifications for critical issues

---

## Docker — Containerization

### Multi-Stage Dockerfile (Node.js)

```dockerfile
# =============================================
# Stage 1: Dependencies
# =============================================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy lockfile first for layer caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && pnpm install --frozen-lockfile --prod; \
  elif [ -f package-lock.json ]; then \
    npm ci --omit=dev; \
  else \
    npm install --omit=dev; \
  fi

# =============================================
# Stage 2: Build (if TypeScript/build step)
# =============================================
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  fi
COPY . .
RUN npx prisma generate 2>/dev/null || true
# RUN npm run build

# =============================================
# Stage 3: Production
# =============================================
FROM node:22-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

# Copy production deps and built code
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/src ./src
COPY --from=build --chown=appuser:appgroup /app/package.json ./

# Copy Prisma if used
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma 2>/dev/null || true
COPY --from=build --chown=appuser:appgroup /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3000
USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
```

### Multi-Stage Dockerfile (Python / FastAPI)

```dockerfile
FROM python:3.13-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependencies
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production
FROM base AS production
RUN adduser --disabled-password --gecos '' appuser

COPY --from=deps /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . .

ENV PATH=/home/appuser/.local/bin:$PATH
ENV PORT=8000

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Docker Compose — Production Stack

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: app
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - backend

  postgres:
    image: postgres:17-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-myapp}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups/postgres:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    networks:
      - backend

  redis:
    image: redis:8-alpine
    container_name: redis
    restart: unless-stopped
    command: >
      redis-server
      --appendonly yes
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 256M
    networks:
      - backend

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:
  caddy_data:
  caddy_config:

networks:
  backend:
    driver: bridge
```

### .dockerignore

```
node_modules
npm-debug.log*
.git
.gitignore
.env
.env.*
*.md
!README.md
Dockerfile*
docker-compose*
.dockerignore
coverage
.nyc_output
tests
__tests__
.vscode
.idea
*.swp
*.swo
dist
.next
.nuxt
```

---

## CI/CD Pipelines

### GitHub Actions — Complete Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '22'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ============================================
  # JOB 1: Lint & Type Check
  # ============================================
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check 2>/dev/null || true

  # ============================================
  # JOB 2: Tests
  # ============================================
  test:
    name: Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:8-alpine
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/testdb
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: test-secret-at-least-32-characters-long
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy 2>/dev/null || true
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  # ============================================
  # JOB 3: Build & Push Docker Image
  # ============================================
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.event_name == 'push'
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

  # ============================================
  # JOB 4: Deploy to Staging
  # ============================================
  deploy-staging:
    name: Deploy Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # SSH deploy, Fly.io, Railway, etc.
          # fly deploy --config fly.staging.toml

  # ============================================
  # JOB 5: Deploy to Production
  # ============================================
  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # fly deploy --config fly.production.toml
```

### GitHub Actions — Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

permissions:
  contents: write

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "")
          if [ -n "$PREV_TAG" ]; then
            CHANGELOG=$(git log ${PREV_TAG}..HEAD --pretty=format:"- %s (%h)" --no-merges)
          else
            CHANGELOG=$(git log --pretty=format:"- %s (%h)" --no-merges -20)
          fi
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - uses: softprops/action-gh-release@v2
        with:
          body: |
            ## Changes
            ${{ steps.changelog.outputs.changelog }}
          generate_release_notes: true
```

---

## Reverse Proxies

### Caddy (Easiest — Auto HTTPS)

```
# Caddyfile
{
    email admin@example.com
    acme_ca https://acme-v02.api.letsencrypt.org/directory
}

# Main domain with auto HTTPS
example.com {
    reverse_proxy app:3000 {
        health_uri /health
        health_interval 30s
        health_timeout 5s

        # Load balancing (multiple backends)
        # lb_policy round_robin
    }

    # Security headers
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        X-Frame-Options SAMEORIGIN
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
        -X-Powered-By
    }

    # Gzip compression
    encode gzip zstd

    # Request size limit
    request_body {
        max_size 10MB
    }

    # Access log
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 5
        }
        format json
    }
}

# API subdomain
api.example.com {
    reverse_proxy app:3000

    header {
        Access-Control-Allow-Origin *
        Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Authorization, Content-Type"
    }

    encode gzip
}

# Redirect www to non-www
www.example.com {
    redir https://example.com{uri} permanent
}
```

### Nginx (Most Common)

```nginx
# /etc/nginx/sites-available/app.conf

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

# Upstream
upstream app_backend {
    least_conn;
    server app:3000;
    # server app2:3000;  # Add more for load balancing
    keepalive 32;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://example.com$request_uri;
}

# Redirect www → non-www
server {
    listen 443 ssl http2;
    server_name www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    return 301 https://example.com$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Hide server info
    server_tokens off;

    # Request limits
    client_max_body_size 10M;
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript
               image/svg+xml;

    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check (don't rate limit)
    location /health {
        proxy_pass http://app_backend;
        access_log off;
    }

    # Static files (if serving frontend)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|webp|avif)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Block common attack paths
    location ~ /\.(git|env|htaccess) {
        deny all;
        return 404;
    }

    # Custom error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }
}
```

---

## Cloud Deployment Platforms

### Fly.io Configuration

```toml
# fly.toml
app = "my-app"
primary_region = "iad"          # US East
kill_signal = "SIGINT"
kill_timeout = 30

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "suspend"
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.tcp_checks]]
    grace_period = "10s"
    interval = "15s"
    timeout = "5s"

  [[services.http_checks]]
    interval = "15s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/health"

[[vm]]
  size = "shared-cpu-1x"
  memory = "512mb"
  cpus = 1

# Attached Postgres
# fly postgres create --name my-app-db --region iad

# Secrets (set via CLI)
# fly secrets set DATABASE_URL="..." JWT_SECRET="..." REDIS_URL="..."
```

### Railway (railway.toml)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 5
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3

# Environment: set in Railway dashboard or CLI
# railway variables set KEY=VALUE
```

### Vercel (vercel.json)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

---

## Monitoring & Observability

### Health Check Endpoint (Production-Grade)

```javascript
// src/health.js — Register as /health and /ready
export function registerHealthChecks(app, dependencies) {
  const startTime = Date.now();

  // Liveness — is the process alive?
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    });
  });

  // Readiness — are all dependencies connected?
  app.get('/ready', async (req, res) => {
    const checks = {};
    let allHealthy = true;

    // Check database
    if (dependencies.db) {
      try {
        const start = Date.now();
        await dependencies.db.$queryRaw`SELECT 1`;
        checks.database = { status: 'connected', latency: Date.now() - start };
      } catch (err) {
        checks.database = { status: 'disconnected', error: err.message };
        allHealthy = false;
      }
    }

    // Check Redis
    if (dependencies.redis) {
      try {
        const start = Date.now();
        await dependencies.redis.ping();
        checks.redis = { status: 'connected', latency: Date.now() - start };
      } catch (err) {
        checks.redis = { status: 'disconnected', error: err.message };
        allHealthy = false;
      }
    }

    // Check external APIs
    if (dependencies.externalAPIs) {
      for (const [name, checkFn] of Object.entries(dependencies.externalAPIs)) {
        try {
          const start = Date.now();
          await checkFn();
          checks[name] = { status: 'reachable', latency: Date.now() - start };
        } catch {
          checks[name] = { status: 'unreachable' };
          // External API down doesn't make us unready (degrade gracefully)
        }
      }
    }

    const status = allHealthy ? 200 : 503;
    res.status(status).json({
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
```

### Prometheus Metrics

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app:3000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/alert-rules.yml'
```

### Application Metrics (Node.js)

```javascript
// prom-client setup
import promClient from 'prom-client';

// Default metrics (CPU, memory, GC, event loop)
promClient.collectDefaultMetrics({ prefix: 'app_' });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Middleware
export function metricsMiddleware(req, res, next) {
  const end = httpRequestDuration.startTimer();
  activeConnections.inc();

  res.on('finish', () => {
    const route = req.route?.path || req.path;
    const labels = { method: req.method, route, status: res.statusCode };
    end(labels);
    httpRequestsTotal.inc(labels);
    activeConnections.dec();
  });

  next();
}

// Metrics endpoint
export function metricsEndpoint(req, res) {
  res.set('Content-Type', promClient.register.contentType);
  promClient.register.metrics().then(m => res.send(m));
}
```

---

## Security Hardening

### Server Security Checklist

```
NETWORK
- [ ] Firewall: only ports 22, 80, 443 open (ufw or iptables)
- [ ] SSH: key-based auth only, disable password login
- [ ] SSH: non-default port (optional but reduces noise)
- [ ] SSH: disable root login
- [ ] Fail2ban installed and configured
- [ ] Cloudflare or CDN in front (DDoS protection)

APPLICATION
- [ ] HTTPS enforced with valid certificate
- [ ] HSTS header with long max-age
- [ ] CSP header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] Rate limiting on all public endpoints
- [ ] Rate limiting on auth endpoints (stricter)
- [ ] File upload size limited
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented (parameterized queries/ORM)
- [ ] XSS prevented (output encoding, CSP)
- [ ] CSRF protection enabled

SECRETS
- [ ] .env not committed to git
- [ ] Secrets stored in vault or platform secrets
- [ ] API keys have minimum required permissions
- [ ] JWT secret is ≥ 32 characters, randomly generated
- [ ] Database passwords are strong and unique
- [ ] Secrets rotated on schedule (90 days)

DOCKER
- [ ] Containers run as non-root user
- [ ] Base images are official and pinned
- [ ] No secrets in Docker images or build args
- [ ] Docker socket NOT mounted in containers
- [ ] Read-only filesystem where possible
- [ ] Resource limits set (CPU, memory)

DATABASE
- [ ] Not exposed to public internet
- [ ] Strong password, not default
- [ ] Automated backups (daily minimum)
- [ ] Backup restoration tested
- [ ] Connection string uses SSL
- [ ] User has minimum required privileges
```

### Environment Variable Validation

```javascript
// src/config/env.js — Validate ALL env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be ≥ 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const [key, errors] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`   ${key}: ${errors.join(', ')}`);
  }
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
```

---

## Deployment Strategies

### Zero-Downtime Deployment

```
BLUE-GREEN DEPLOYMENT
======================
1. "Blue" (current) serves traffic
2. Deploy "Green" (new version) alongside
3. Run health checks on Green
4. Switch load balancer to Green
5. Keep Blue running for 5 minutes (rollback window)
6. Decommission Blue

┌──────────┐     ┌──────────┐
│  Blue v1 │ ←── │  Load    │ ←── Users
│ (current)│     │ Balancer │
└──────────┘     └──────────┘
                      │
┌──────────┐          │ (switch)
│ Green v2 │ ←────────┘
│  (new)   │
└──────────┘


ROLLING UPDATE (Docker Swarm / K8s)
=====================================
1. Start 1 new container with v2
2. Wait for it to pass health checks
3. Remove 1 old v1 container
4. Repeat until all containers are v2

   v1  v1  v1  v1    ← Start
   v2  v1  v1  v1    ← Rolling
   v2  v2  v1  v1    ← Rolling
   v2  v2  v2  v1    ← Rolling
   v2  v2  v2  v2    ← Complete


CANARY DEPLOYMENT
==================
1. Route 5% of traffic to new version
2. Monitor error rates and latency
3. Gradually increase: 5% → 25% → 50% → 100%
4. Roll back if metrics degrade

   v1  v1  v1  v1  v1  v1  v1  v1  v1  v2  ← 10% canary
   v1  v1  v1  v1  v1  v2  v2  v2  v2  v2  ← 50%
   v2  v2  v2  v2  v2  v2  v2  v2  v2  v2  ← 100% promoted
```

### Database Migrations in Production

```
SAFE MIGRATION RULES:
1. NEVER delete columns in the same release that removes code using them
2. NEVER rename columns — add new, migrate data, remove old (3 releases)
3. Always make migrations backward-compatible
4. Run migrations BEFORE deploying new code
5. Test migration + rollback on staging first

SAFE PROCESS:
  Release 1: Add new column (nullable) → deploy code that writes to both
  Release 2: Backfill data → deploy code that reads from new column
  Release 3: Remove old column → deploy code that ignores old column
```

---

## Backup & Disaster Recovery

### PostgreSQL Backup Script

```bash
#!/bin/bash
# backup-postgres.sh — Run daily via cron

set -euo pipefail

DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-myapp}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="${DB_NAME}_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: $FILENAME"

# Dump and compress
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/${FILENAME}"

# Upload to S3 (optional)
# aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://my-backups/postgres/${FILENAME}"

# Delete old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete: $FILENAME ($(du -h ${BACKUP_DIR}/${FILENAME} | cut -f1))"
```

### Cron Schedule

```
# /etc/crontab or crontab -e

# Database backup — daily at 2 AM
0 2 * * * /opt/scripts/backup-postgres.sh >> /var/log/backups.log 2>&1

# SSL certificate renewal — twice daily
0 0,12 * * * certbot renew --quiet

# Log rotation — weekly
0 0 * * 0 logrotate /etc/logrotate.d/app

# Health check — every 5 minutes
*/5 * * * * curl -sf http://localhost:3000/health > /dev/null || echo "APP DOWN" | mail -s "ALERT" ops@example.com
```

---

## Log Management

### Structured Logging (Pino)

```javascript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Pretty print in development
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,

  // Redact sensitive data
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.creditCard',
      '*.ssn',
    ],
    censor: '[REDACTED]',
  },

  // Standard fields
  base: {
    service: process.env.SERVICE_NAME || 'my-app',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  },

  // Serializers
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});
```

### Log Levels Guide

```
FATAL  — App cannot continue. Process exit imminent.
         Example: "Cannot connect to database after 10 retries"

ERROR  — Operation failed. Needs attention.
         Example: "Payment processing failed for order #123"

WARN   — Something unexpected but recoverable.
         Example: "Rate limit approaching for API key xyz"

INFO   — Key business events. Normal operations.
         Example: "User registered", "Order placed", "Deploy started"

DEBUG  — Detailed technical info for debugging.
         Example: "SQL query took 45ms", "Cache miss for key xyz"

TRACE  — Very verbose. Only in development.
         Example: "Entering function X with params {...}"
```

---

## Production Launch Checklist

```
PRE-LAUNCH
==========
- [ ] All environment variables validated at startup
- [ ] Database migrations applied and tested
- [ ] SSL/TLS certificate valid and auto-renewing
- [ ] DNS configured and propagated
- [ ] CDN/Cloudflare configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Error tracking (Sentry) connected
- [ ] Health check endpoint responding
- [ ] Logging configured (structured, redacted)
- [ ] Backup system running and tested
- [ ] Monitoring dashboards set up
- [ ] Alerting configured (PagerDuty/Slack)

DEPLOYMENT
==========
- [ ] CI/CD pipeline green
- [ ] Docker image built and pushed
- [ ] Staging deploy tested
- [ ] Load test completed (optional)
- [ ] Zero-downtime deployment verified
- [ ] Rollback plan documented
- [ ] Database backup taken pre-deploy

POST-LAUNCH
============
- [ ] Health check passing
- [ ] No errors in monitoring
- [ ] Response times normal
- [ ] SSL certificate valid (check ssllabs.com)
- [ ] Security headers verified (check securityheaders.com)
- [ ] DNS resolving correctly
- [ ] Email delivery working
- [ ] Payment processing working
- [ ] Third-party integrations verified
```

---

## Anti-Patterns to Avoid

❌ **Never store secrets in Docker images** — use runtime env vars or secrets  
❌ **Never run containers as root** — create a non-root user  
❌ **Never deploy directly to production** — always use CI/CD  
❌ **Never skip health checks** — load balancers need them  
❌ **Never ignore monitoring alerts** — alert fatigue kills  
❌ **Never modify production manually** — all changes via code  
❌ **Never use `latest` tag** — pin versions for reproducibility  
❌ **Never expose database to the internet** — use private networks  
❌ **Never skip backup testing** — untested backups don't exist  
❌ **Never deploy on Friday** — Murphy's Law is real  
❌ **Never share credentials** — per-person/per-service keys  
❌ **Never log PII/passwords** — redact everything sensitive  
