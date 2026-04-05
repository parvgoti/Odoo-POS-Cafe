# =============================================
# Backend Mastery — Multi-Stage Dockerfile (2026)
# =============================================
# Optimized for Node.js 22 backend applications.
# 3-stage build: deps → build → production
# =============================================

# Stage 1: Install production dependencies only
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && pnpm install --frozen-lockfile --prod; \
  elif [ -f package-lock.json ]; then \
    npm ci --omit=dev; \
  else \
    npm install --omit=dev; \
  fi

# Stage 2: Build (includes devDependencies for build tools)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi
COPY . .
# Generate Prisma client (if using Prisma)
RUN npx prisma generate 2>/dev/null || true
# Build TypeScript (if applicable)
# RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

# Copy production dependencies
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application code
COPY --from=build --chown=appuser:appgroup /app/src ./src
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma 2>/dev/null || true
COPY --from=build --chown=appuser:appgroup /app/package.json ./
COPY --from=build --chown=appuser:appgroup /app/node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle PID 1 and signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/server.js"]
