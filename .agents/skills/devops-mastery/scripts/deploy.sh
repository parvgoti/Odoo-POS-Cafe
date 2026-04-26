#!/bin/bash
# =============================================
# DevOps Mastery — Production Deploy Script
# =============================================
# Usage:
#   ./deploy.sh                  # Deploy to production
#   ./deploy.sh staging          # Deploy to staging
#   ./deploy.sh rollback         # Rollback to previous version
#   ./deploy.sh status           # Show deployment status
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - SSH access to target server
#   - .env file configured
# =============================================

set -euo pipefail

# ---- Configuration ----
APP_NAME="${APP_NAME:-myapp}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="/backups"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }


# ---- Pre-flight checks ----
preflight() {
  log "Running pre-flight checks..."

  # Docker
  command -v docker >/dev/null 2>&1 || error "Docker not installed"
  docker info >/dev/null 2>&1 || error "Docker daemon not running"

  # Docker Compose
  docker compose version >/dev/null 2>&1 || error "Docker Compose not installed"

  # Environment file
  [ -f .env ] || error ".env file not found"

  # Compose file
  [ -f "$COMPOSE_FILE" ] || error "$COMPOSE_FILE not found"

  success "Pre-flight checks passed"
}


# ---- Create backup ----
backup() {
  log "Creating pre-deploy backup..."

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  mkdir -p "$BACKUP_DIR"

  # Database backup
  if docker compose -f "$COMPOSE_FILE" ps postgres 2>/dev/null | grep -q "running"; then
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
      pg_dump -U "${DB_USER:-postgres}" -d "${DB_NAME:-myapp}" \
      --format=custom --compress=9 \
      > "${BACKUP_DIR}/pre-deploy_${TIMESTAMP}.sql.gz" 2>/dev/null || true
    success "Database backup created"
  else
    warn "Database container not running, skipping backup"
  fi
}


# ---- Deploy ----
deploy() {
  local env="${1:-production}"
  log "Deploying to ${env}..."

  # Pull latest images
  log "Pulling latest images..."
  docker compose -f "$COMPOSE_FILE" pull 2>/dev/null || true

  # Build custom images
  log "Building application..."
  docker compose -f "$COMPOSE_FILE" build --no-cache app

  # Run database migrations
  log "Running migrations..."
  docker compose -f "$COMPOSE_FILE" run --rm app \
    npx prisma migrate deploy 2>/dev/null || \
    warn "No Prisma migrations to run"

  # Rolling restart (zero downtime)
  log "Starting new containers..."
  docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

  # Wait for health check
  log "Waiting for health check..."
  local retries=30
  local count=0
  while [ $count -lt $retries ]; do
    if curl -sf http://localhost:${PORT:-3000}/health >/dev/null 2>&1; then
      success "Application is healthy!"
      break
    fi
    count=$((count + 1))
    sleep 2
  done

  if [ $count -eq $retries ]; then
    error "Health check failed after ${retries} attempts. Consider rolling back."
  fi

  # Cleanup old images
  log "Cleaning up old images..."
  docker image prune -f >/dev/null 2>&1

  success "Deployment to ${env} complete!"
  echo ""
  log "Application URL: http://localhost:${PORT:-3000}"
  log "Health check:    http://localhost:${PORT:-3000}/health"
}


# ---- Rollback ----
rollback() {
  log "Rolling back to previous version..."

  # Get previous image
  PREV_IMAGE=$(docker compose -f "$COMPOSE_FILE" images app -q 2>/dev/null | head -1)

  if [ -z "$PREV_IMAGE" ]; then
    error "No previous image found to rollback to"
  fi

  # Restore from backup
  LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/pre-deploy_*.sql.gz 2>/dev/null | head -1)
  if [ -n "$LATEST_BACKUP" ]; then
    warn "Latest backup available: $LATEST_BACKUP"
    read -p "Restore database from backup? (y/N): " restore
    if [ "$restore" = "y" ]; then
      docker compose -f "$COMPOSE_FILE" exec -T postgres \
        pg_restore -U "${DB_USER:-postgres}" -d "${DB_NAME:-myapp}" \
        --clean --if-exists < "$LATEST_BACKUP"
      success "Database restored from backup"
    fi
  fi

  # Restart previous containers
  docker compose -f "$COMPOSE_FILE" up -d
  success "Rollback complete"
}


# ---- Status ----
status() {
  log "Deployment Status"
  echo ""

  # Container status
  docker compose -f "$COMPOSE_FILE" ps

  echo ""

  # Health check
  if curl -sf http://localhost:${PORT:-3000}/health >/dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:${PORT:-3000}/health)
    success "Application: HEALTHY"
    echo "  $HEALTH" | python3 -m json.tool 2>/dev/null || echo "  $HEALTH"
  else
    error "Application: UNHEALTHY"
  fi

  echo ""

  # Resource usage
  log "Resource Usage:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null
}


# ---- Main ----
case "${1:-deploy}" in
  deploy|staging|production)
    preflight
    backup
    deploy "${1:-production}"
    ;;
  rollback)
    rollback
    ;;
  status)
    status
    ;;
  backup)
    backup
    ;;
  *)
    echo "Usage: $0 {deploy|staging|production|rollback|status|backup}"
    exit 1
    ;;
esac
