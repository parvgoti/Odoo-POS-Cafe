#!/bin/bash
# ============================================================
# PostgreSQL Backup Script — Database Mastery Skill
# Automated backup with rotation and optional S3 upload (2026)
#
# Usage:
#   ./backup.sh                    # Full backup
#   ./backup.sh --schema-only      # Schema only
#   ./backup.sh --upload           # Backup + upload to S3
#
# Environment variables:
#   DATABASE_URL    — PostgreSQL connection string (required)
#   BACKUP_DIR      — Local backup directory (default: ./backups)
#   BACKUP_RETAIN   — Days to keep backups (default: 30)
#   S3_BUCKET       — S3 bucket for uploads (optional)
#   S3_PREFIX       — S3 key prefix (default: db-backups/)
# ============================================================

set -euo pipefail

# Config
DB_URL="${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETAIN_DAYS="${BACKUP_RETAIN:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME=$(echo "$DB_URL" | grep -oP '/\K[^?]+' | head -1)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
SCHEMA_ONLY=false
UPLOAD=false

# Parse args
for arg in "$@"; do
  case $arg in
    --schema-only) SCHEMA_ONLY=true ;;
    --upload) UPLOAD=true ;;
  esac
done

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo ""
echo "🗄️  PostgreSQL Backup"
echo "================================"
echo "  Database:  $DB_NAME"
echo "  Timestamp: $TIMESTAMP"
echo "  Output:    $BACKUP_FILE"
echo ""

# Run backup
if [ "$SCHEMA_ONLY" = true ]; then
  echo "  📋 Schema-only backup..."
  pg_dump "$DB_URL" --schema-only --no-owner --no-privileges | gzip > "$BACKUP_FILE"
else
  echo "  📦 Full backup (data + schema)..."
  pg_dump "$DB_URL" --no-owner --no-privileges --format=plain | gzip > "$BACKUP_FILE"
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  ✅ Backup complete: $BACKUP_SIZE"

# Upload to S3
if [ "$UPLOAD" = true ] && [ -n "${S3_BUCKET:-}" ]; then
  S3_KEY="${S3_PREFIX:-db-backups/}${DB_NAME}_${TIMESTAMP}.sql.gz"
  echo "  ☁️  Uploading to s3://$S3_BUCKET/$S3_KEY ..."
  aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_KEY" --storage-class STANDARD_IA
  echo "  ✅ Upload complete"
fi

# Rotate old backups
echo "  🔄 Removing backups older than $RETAIN_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETAIN_DAYS -delete -print | wc -l)
echo "  ✅ Removed $DELETED old backup(s)"

echo ""
echo "✅ Backup finished successfully!"
echo ""

# ============================================================
# Restore command:
#   gunzip -c backup_file.sql.gz | psql "$DATABASE_URL"
#
# Cron example (daily at 2 AM):
#   0 2 * * * /path/to/backup.sh --upload >> /var/log/db-backup.log 2>&1
# ============================================================
