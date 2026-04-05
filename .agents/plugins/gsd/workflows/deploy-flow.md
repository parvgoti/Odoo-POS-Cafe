---
description: Deploy application to production with zero-downtime and rollback plan
---

# Deploy Flow Workflow

Take an application from local development to running in production
with HTTPS, monitoring, backups, and a rollback plan.

## Prerequisites
- All tests passing
- Docker working locally
- Domain configured (optional)

## Steps

1. **Pre-deploy checks**
   - Confirm all tests pass: `npm test`
   - Confirm Docker builds: `docker build -t myapp .`
   - Confirm no secrets in code: check `.env` not committed
   - Confirm environment variables documented in `.env.example`
   - Review recent changes: `git log --oneline -5`

2. **Choose deployment target**
   Ask the user which platform:
   - **Fly.io** — Best for most apps (recommended)
   - **Railway** — Simplest, GitHub-connected
   - **Vercel** — Best for Next.js/static
   - **VPS** — Full control (Hetzner, DigitalOcean)
   - **AWS** — Enterprise scale

3. **Platform-specific setup**

   **For Fly.io:**
   ```bash
   fly auth login
   fly launch
   fly postgres create --name myapp-db
   fly postgres attach myapp-db
   fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
   ```

   **For Railway:**
   ```bash
   railway login
   railway init
   railway add --plugin postgresql
   railway variables set JWT_SECRET="$(openssl rand -base64 32)"
   ```

   **For VPS:**
   - Run server setup script
   - Clone repo on server
   - Set up `.env` on server
   - Configure reverse proxy (Caddy/Nginx)

4. **Configure secrets**
   Set all production environment variables:
   - DATABASE_URL
   - REDIS_URL (if used)
   - JWT_SECRET (generate securely)
   - Any API keys (Stripe, email service, etc.)
   - APP_URL (production domain)
   - NODE_ENV=production

5. **Database setup**
   - Run migrations on production database
   - Seed initial data if needed (admin user, plans, etc.)
   - Verify database connection

6. **Deploy**
   ```bash
   # Fly.io
   fly deploy

   # Railway
   railway up

   # VPS
   docker compose -f docker-compose.prod.yml up -d
   ```

7. **Post-deploy verification**
   ```bash
   # Health check
   curl -s https://yourdomain.com/health | jq

   # Readiness check
   curl -s https://yourdomain.com/ready | jq

   # Test a protected endpoint
   curl -s https://yourdomain.com/api/v1/auth/login \
     -X POST -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"..."}' | jq
   ```

8. **SSL verification**
   - Check certificate: `curl -vI https://yourdomain.com`
   - Test at ssllabs.com/ssltest
   - Verify HSTS header present

9. **Monitoring setup**
   - Set up uptime monitoring (UptimeRobot / BetterStack)
   - Configure error tracking (Sentry)
   - Set up alerting (Slack/email on downtime)

10. **Backup verification**
    - Confirm database backups are running
    - Test backup restoration (on staging)
    - Document recovery procedure

11. **DNS & Domain** (if applicable)
    - Point A record to server IP
    - Set up www redirect
    - Configure email DNS (SPF, DKIM, DMARC)
    - Verify DNS propagation: `dig yourdomain.com`

12. **Security checks**
    - Verify at securityheaders.com
    - Confirm rate limiting active
    - Test CORS configuration
    - Verify .env and .git not accessible

13. **Document the deployment**
    Create walkthrough.md with:
    - Deployment URL
    - How to deploy updates
    - How to rollback
    - How to access logs
    - How to connect to production database

14. **Report to user**
    Summary with deployment URL and next steps.
