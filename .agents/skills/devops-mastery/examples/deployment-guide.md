# DevOps Mastery — Full-Stack Deployment Guide

Step-by-step guide to deploy a Node.js/Python application from zero to production.

---

## Deployment Options — Quick Reference

| Platform | Best For | Cost | Complexity | SSL | DB |
|----------|----------|------|------------|-----|-----|
| **Fly.io** | Full-stack apps, APIs | Free tier + $5/mo | Low | Auto | Postgres addon |
| **Railway** | Quick deploys, full-stack | Free tier + $5/mo | Very Low | Auto | Built-in |
| **Vercel** | Next.js, static, serverless | Free tier | Very Low | Auto | External |
| **Render** | Full-stack, background jobs | Free tier + $7/mo | Low | Auto | Postgres addon |
| **VPS (Hetzner)** | Full control, multi-app | €4-10/mo | Medium | Manual/Caddy | Self-managed |
| **AWS (ECS/EKS)** | Enterprise, scaling | Pay-as-you-go | High | ACM + ALB | RDS |
| **DigitalOcean** | App Platform or VPS | $5-12/mo | Low-Medium | Auto | Managed DB |
| **Coolify** | Self-hosted PaaS | VPS cost only | Medium | Auto | Addon |

---

## Option A: Fly.io (Recommended for Most Apps)

### 1. Install CLI & Login
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### 2. Launch App
```bash
cd your-project

# Initialize (creates fly.toml)
fly launch

# During setup:
# - Choose region (iad = US East, fra = Europe, nrt = Asia)
# - Skip database if you'll add separately
```

### 3. Set Secrets
```bash
fly secrets set \
  DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  REDIS_URL="redis://default:pass@host:6379" \
  NODE_ENV="production"
```

### 4. Add PostgreSQL
```bash
# Create Fly Postgres cluster
fly postgres create --name myapp-db --region iad

# Attach to your app (sets DATABASE_URL automatically)
fly postgres attach myapp-db
```

### 5. Deploy
```bash
fly deploy

# Check status
fly status
fly logs

# Scale
fly scale count 2        # 2 instances
fly scale vm shared-cpu-2x  # Upgrade VM
```

### 6. Custom Domain
```bash
fly certs create example.com
fly certs create www.example.com

# Add DNS records:
# A     @     your-fly-ip
# AAAA  @     your-fly-ipv6
# CNAME www   your-app.fly.dev
```

---

## Option B: VPS (Hetzner / DigitalOcean / Linode)

### 1. Provision Server
```bash
# Hetzner: CX22 (2 vCPU, 4GB RAM, €4/mo)
# DigitalOcean: $6/mo droplet
# Choose: Ubuntu 24.04

# SSH in
ssh root@your-server-ip
```

### 2. Run Server Setup Script
```bash
# Copy the setup script from this skill
scp scripts/setup-server.sh root@server:/tmp/
ssh root@server "chmod +x /tmp/setup-server.sh && /tmp/setup-server.sh"
```

### 3. Clone & Deploy
```bash
# Switch to deploy user
su - deploy

# Clone your app
git clone https://github.com/you/your-app.git /app
cd /app

# Create .env
cp .env.example .env
nano .env  # Fill in production values

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

### 4. Setup Domain + SSL
```bash
# Point your domain A record to server IP

# If using Caddy (auto SSL):
# Just set your domain in Caddyfile, Caddy handles the rest

# If using Nginx + Certbot:
sudo certbot certonly --standalone -d example.com -d www.example.com
```

### 5. Monitoring
```bash
# Container logs
docker compose logs -f app

# System resources
htop
df -h
free -h

# Docker stats
docker stats
```

---

## Option C: Railway (Simplest)

### 1. Connect GitHub
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init
```

### 2. Add Services
```bash
# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis
```

### 3. Deploy
```bash
# Set env vars
railway variables set JWT_SECRET="$(openssl rand -base64 32)"

# Deploy
railway up

# Open
railway open
```

---

## Post-Deployment Checklist

```
VERIFY
======
□ Health check endpoint responding:  curl https://example.com/health
□ SSL certificate valid:             curl -vI https://example.com
□ No errors in logs:                 fly logs / docker compose logs
□ Database connected:                curl https://example.com/ready
□ API endpoints working:             test with actual requests
□ Response times acceptable:         < 200ms for simple queries

MONITOR
=======
□ Error tracking (Sentry) receiving events
□ Uptime monitoring set up (UptimeRobot, BetterStack)
□ Log aggregation working
□ Alerts configured for downtime
□ Database backups running

SECURITY
========
□ SSL Labs score: A+ (ssllabs.com/ssltest)
□ Security headers: A (securityheaders.com)
□ No exposed .env or .git
□ Rate limiting active
□ CORS configured correctly
```

---

## Rollback Procedure

```bash
# Fly.io
fly releases
fly deploy --image registry.fly.io/myapp:sha-abc123   # Deploy specific version

# Docker Compose (VPS)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Railway
railway rollback

# Database rollback (if needed)
# Restore from backup taken before deploy
pg_restore -U postgres -d myapp < /backups/pre-deploy-latest.sql.gz
```
