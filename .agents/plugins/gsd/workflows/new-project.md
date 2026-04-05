---
description: Scaffold a new full-stack project from scratch with all infrastructure
---

# New Project Workflow

Create a complete, production-ready project in minutes.

## Prerequisites
- Node.js 22+ installed
- Docker installed (optional but recommended)
- Git initialized

## Steps

1. **Confirm requirements with the user**
   Ask:
   - Project name?
   - What type? (SaaS app / REST API / Landing page / CLI tool)
   - Frontend framework? (React + Vite / Next.js / Vanilla HTML)
   - Database? (PostgreSQL / MongoDB / SQLite)
   - Auth method? (JWT / OAuth / Session)
   - Deploy target? (Fly.io / Railway / Vercel / VPS)

2. **Create project directory and initialize**
   ```bash
   mkdir <project-name> && cd <project-name>
   git init
   npm init -y
   ```

// turbo
3. **Install core dependencies**
   ```bash
   npm install express@5 zod pino pino-pretty helmet cors cookie-parser
   npm install -D vitest @faker-js/faker supertest nodemon dotenv
   ```

4. **Install database ORM**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   npx prisma init
   ```

5. **Create directory structure**
   Create all folders:
   ```
   src/config, src/lib, src/middleware, src/routes, src/services, src/utils
   prisma, tests/unit, tests/integration, tests/e2e
   ```

6. **Create environment config**
   - `.env.example` with all required variables
   - `src/config/env.js` with Zod validation
   - `.gitignore` with node_modules, .env, dist, coverage

7. **Create database schema**
   - `prisma/schema.prisma` with User model
   - Include: id, name, email, password, role, timestamps

8. **Create core modules**
   - `src/lib/database.js` — Prisma client singleton
   - `src/lib/logger.js` — Pino logger
   - `src/utils/errors.js` — Custom error classes
   - `src/utils/api-response.js` — Standard response helpers

9. **Create middleware**
   - `src/middleware/auth.js` — JWT authentication
   - `src/middleware/validate.js` — Zod validation
   - `src/middleware/error-handler.js` — Global error handling
   - `src/middleware/rate-limit.js` — Rate limiting

10. **Create auth routes**
    - POST /api/v1/auth/register
    - POST /api/v1/auth/login
    - POST /api/v1/auth/refresh
    - GET /api/v1/auth/me

11. **Create app entry point**
    - `src/app.js` — Express app with middleware
    - `src/server.js` — HTTP server with graceful shutdown

12. **Create health check**
    - GET /health — Liveness
    - GET /ready — Readiness with dependency checks

13. **Create test setup**
    - `vitest.config.js`
    - `tests/setup.js`
    - `tests/factories.js`
    - One passing test for health endpoint

14. **Create Docker files**
    - `Dockerfile` — Multi-stage production build
    - `docker-compose.yml` — Dev: App + Postgres + Redis
    - `.dockerignore`

15. **Create CI/CD**
    - `.github/workflows/ci-cd.yml` — Lint, test, build, deploy

16. **Create README.md**
    Include: project description, setup instructions, scripts, API docs

// turbo
17. **Run database migration**
    ```bash
    npx prisma migrate dev --name init
    ```

// turbo
18. **Run tests to verify**
    ```bash
    npm test
    ```

19. **Report to user**
    Summarize what was created and how to run it:
    ```
    npm run dev       # Start development server
    npm test          # Run tests
    docker compose up # Start with Docker
    ```
