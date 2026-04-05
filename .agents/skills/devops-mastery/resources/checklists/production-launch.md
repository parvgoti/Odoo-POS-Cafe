# =============================================
# Production Launch Checklist
# =============================================
# Complete this BEFORE going live.
# Every item must be verified.
# =============================================

## Infrastructure

### Server / Platform
- [ ] Server provisioned (correct region, close to users)
- [ ] SSH key-based auth only (password disabled)
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] Fail2ban or rate limiting on SSH
- [ ] Non-root deploy user created
- [ ] Automatic security updates enabled
- [ ] Swap configured (for small servers)
- [ ] Timezone set correctly

### Docker
- [ ] Images built from official base images
- [ ] Multi-stage build (small final image)
- [ ] Non-root user in container
- [ ] dumb-init or tini for signal handling
- [ ] Health check defined
- [ ] Resource limits set (CPU, memory)
- [ ] Logging driver configured (json-file with rotation)
- [ ] No secrets in images or build args
- [ ] `.dockerignore` configured

### Database
- [ ] PostgreSQL/MySQL not exposed to public internet
- [ ] Strong password (not default)
- [ ] Connection uses SSL/TLS
- [ ] Automated daily backups configured
- [ ] Backup restoration tested at least once
- [ ] Connection pooling configured
- [ ] Migrations applied and tested
- [ ] Database user has minimum privileges

### Redis
- [ ] Password set (requirepass)
- [ ] maxmemory and eviction policy configured
- [ ] Persistence enabled (AOF or RDB)
- [ ] Not exposed to public internet

---

## Application

### Environment
- [ ] All env vars validated at startup (Zod/joi)
- [ ] `.env` not committed to git
- [ ] `.env.example` up to date
- [ ] Secrets generated securely (openssl rand)
- [ ] JWT secret ≥ 32 characters
- [ ] NODE_ENV=production

### Security
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] SSL/TLS certificate valid and auto-renewing
- [ ] HSTS header enabled (63072000 max-age)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured
- [ ] CORS origins explicitly listed (not wildcard)
- [ ] Rate limiting on all public endpoints
- [ ] Stricter rate limiting on auth endpoints
- [ ] File upload size limited
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection enabled
- [ ] Helmet.js or equivalent enabled
- [ ] Server/framework version headers removed
- [ ] No sensitive data in error responses

### API
- [ ] Health check endpoint (/health) responding
- [ ] Readiness endpoint (/ready) checking dependencies
- [ ] API versioning in place
- [ ] Rate limit headers returned (X-RateLimit-*)
- [ ] Request ID header (X-Request-Id) for tracing
- [ ] Error responses follow consistent format

---

## Observability

### Monitoring
- [ ] Uptime monitoring (UptimeRobot, BetterStack, Pingdom)
- [ ] Resource monitoring (CPU, memory, disk)
- [ ] Application metrics (request rate, error rate, latency)
- [ ] Database monitoring (connections, slow queries)
- [ ] Container monitoring (cAdvisor or Docker stats)

### Logging
- [ ] Structured JSON logging in production
- [ ] Sensitive data redacted from logs
- [ ] Request/response logging with request IDs
- [ ] Log rotation configured
- [ ] Log aggregation set up (optional)

### Alerting
- [ ] Alert on application downtime (< 1 min)
- [ ] Alert on high error rate (> 5%)
- [ ] Alert on high latency (p95 > 2s)
- [ ] Alert on high CPU (> 85% for 10 min)
- [ ] Alert on high memory (> 90%)
- [ ] Alert on disk space (> 85%)
- [ ] Alert on SSL cert expiry (< 14 days)
- [ ] Alert on database down
- [ ] Alert on failed backups
- [ ] Alert delivery tested (Slack/email/PagerDuty)

### Error Tracking
- [ ] Sentry or equivalent configured
- [ ] Source maps uploaded
- [ ] Release tracking enabled
- [ ] Alert thresholds set

---

## CI/CD

- [ ] Pipeline runs on every push
- [ ] Lint check in pipeline
- [ ] Tests in pipeline (with real DB)
- [ ] Security audit in pipeline
- [ ] Docker build in pipeline
- [ ] Image pushed to registry
- [ ] Staging deployment automatic
- [ ] Production deployment requires approval
- [ ] Rollback procedure documented and tested

---

## DNS & Domain

- [ ] Domain pointed to server/platform
- [ ] A/AAAA records set
- [ ] CNAME for www → non-www (or vice versa)
- [ ] MX records for email (if needed)
- [ ] SPF record for email sending
- [ ] DKIM configured for email sending
- [ ] DMARC policy configured
- [ ] DNS propagation verified
- [ ] Cloudflare or CDN configured (optional)

---

## Documentation

- [ ] README with setup instructions
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Runbook for common issues
- [ ] Architecture diagram
- [ ] On-call rotation defined
- [ ] Incident response plan documented

---

## Score

| Category | Items | ✅ Done | Score |
|----------|-------|---------|-------|
| Infrastructure | 22 | /22 | % |
| Application | 26 | /26 | % |
| Observability | 20 | /20 | % |
| CI/CD | 9 | /9 | % |
| DNS & Domain | 9 | /9 | % |
| Documentation | 7 | /7 | % |
| **TOTAL** | **93** | **/93** | **%** |

**Launch threshold: ≥ 85% completion required.**
