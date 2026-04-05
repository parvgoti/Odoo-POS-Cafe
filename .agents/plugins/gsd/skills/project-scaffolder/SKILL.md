---
name: project-scaffolder
description: >
  Rapidly scaffold production-ready full-stack projects in seconds. Creates entire
  project structures with backend API, frontend UI, database schema, authentication,
  testing, Docker, CI/CD, and deployment configs — all pre-wired and ready to run.
  Use when starting a new project, adding a new module, or creating a microservice.
---

# Project Scaffolder Skill

Instantly create production-ready project structures by combining all 7 mastery skills
into a single cohesive scaffold. No boilerplate busywork — go from idea to running
code in minutes.

---

## When to Use

- Starting a **new full-stack project** from scratch
- Adding a **new feature module** to an existing project
- Creating a **microservice** or **API service**
- Scaffolding a **landing page** or **dashboard**
- Setting up **test infrastructure** for an existing project
- Creating a **CLI tool** or **SDK library**

---

## Project Templates

### 1. Full-Stack SaaS App

**Command**: "Scaffold a full-stack SaaS app"

**Creates**:
```
project/
├── package.json                    # Root workspace
├── .env.example                    # Environment template
├── .gitignore
├── docker-compose.yml              # Dev: App + Postgres + Redis
├── docker-compose.prod.yml         # Prod: Full stack
├── Dockerfile                      # Multi-stage Node.js
├── .dockerignore
├── Caddyfile                       # Reverse proxy + auto HTTPS
├── .github/workflows/
│   └── ci-cd.yml                   # Full CI/CD pipeline
│
├── src/
│   ├── server.js                   # Entry point
│   ├── app.js                      # Express app setup
│   ├── config/
│   │   └── env.js                  # Zod env validation
│   ├── lib/
│   │   ├── database.js             # Prisma client
│   │   ├── redis.js                # Redis client
│   │   ├── logger.js               # Pino structured logging
│   │   └── email.js                # Email service
│   ├── middleware/
│   │   ├── auth.js                 # JWT auth middleware
│   │   ├── validate.js             # Zod validation middleware
│   │   ├── error-handler.js        # Global error handler
│   │   ├── rate-limit.js           # Rate limiting
│   │   └── cors.js                 # CORS config
│   ├── routes/
│   │   ├── index.js                # Route registry
│   │   ├── auth.routes.js          # Auth: register/login/refresh
│   │   ├── user.routes.js          # User CRUD
│   │   └── health.routes.js        # Health checks
│   ├── services/
│   │   ├── auth.service.js         # Auth business logic
│   │   └── user.service.js         # User business logic
│   └── utils/
│       ├── api-response.js         # Standard response helpers
│       ├── errors.js               # Custom error classes
│       └── pagination.js           # Pagination helpers
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── seed.js                     # Database seeder
│   └── migrations/                 # Migration files
│
├── tests/
│   ├── setup.js                    # Test setup
│   ├── factories.js                # Test data factories
│   ├── unit/                       # Unit tests
│   ├── integration/                # API integration tests
│   └── e2e/                        # Playwright E2E tests
│
├── vitest.config.js                # Vitest configuration
├── playwright.config.js            # Playwright configuration
└── README.md                       # Project documentation
```

### 2. REST API Service

**Command**: "Scaffold a REST API service"

**Creates**: Backend-only API with auth, database, testing, Docker, and deployment.

### 3. React + Vite Frontend

**Command**: "Scaffold a React frontend"

**Creates**:
```
frontend/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                   # Design system
│   ├── components/
│   │   ├── ui/                     # Base components
│   │   └── layout/                 # Layout components
│   ├── pages/
│   ├── hooks/
│   ├── services/                   # API client
│   ├── stores/                     # State management
│   └── utils/
├── tests/                          # Component tests
└── e2e/                            # E2E tests
```

### 4. Landing Page

**Command**: "Scaffold a landing page"

**Creates**: Single HTML/CSS/JS landing page with hero, features, pricing,
testimonials, FAQ, CTA, and footer — fully responsive, animated, premium design.

### 5. CLI Tool

**Command**: "Scaffold a CLI tool"

**Creates**: Node.js CLI with argument parsing, commands, colored output,
progress bars, and packaging config.

---

## Scaffold Process

When scaffolding, ALWAYS follow this order:

1. **Create directory structure** — All folders and empty files
2. **Package.json** — Dependencies, scripts, metadata
3. **Environment** — .env.example with all required vars
4. **Database schema** — Prisma schema with User model + auth
5. **Core config** — env validation, logger, database client
6. **Middleware** — auth, validation, error handling, CORS, rate limit
7. **Routes + Services** — Auth flow first, then CRUD routes
8. **Testing** — Setup, factories, first passing test
9. **Docker** — Dockerfile, compose, .dockerignore
10. **CI/CD** — GitHub Actions pipeline
11. **Documentation** — README with setup instructions
12. **Verify** — Run `npm install && npm test` to confirm everything works

---

## Default Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22+ |
| Backend | Express | 5.x |
| Database | PostgreSQL | 17 |
| ORM | Prisma | 6.x |
| Cache | Redis | 8.x |
| Auth | JWT (jose) | Latest |
| Validation | Zod | 3.x |
| Logging | Pino | 9.x |
| Testing | Vitest | 3.x |
| E2E Testing | Playwright | Latest |
| Frontend | React + Vite | 19 + 6 |
| Containers | Docker | Latest |
| CI/CD | GitHub Actions | Latest |
| Proxy | Caddy | 2.x |
| Deploy | Fly.io | Latest |

---

## Quick Scaffolding Rules

1. **Every file must have content** — No empty placeholder files
2. **Every route must be testable** — Integration test included
3. **Every env var must be validated** — Zod schema at startup
4. **Auth must work out of the box** — Register, login, protected routes
5. **Docker must build and run** — `docker compose up` = working app
6. **Tests must pass** — Green on first run
7. **README must explain setup** — Clone → install → run in 3 commands
