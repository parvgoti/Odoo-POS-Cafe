---
name: task-executor
description: >
  Intelligent task decomposition and execution skill. Breaks down complex requests
  into atomic, trackable steps and executes them methodically. Handles context
  switching, dependency ordering, rollback on failure, and progress tracking.
  Use when the user gives a broad goal that requires multi-step execution.
---

# Task Executor Skill

Takes any development goal — from "add user settings page" to "migrate database
to PostgreSQL" — and breaks it into atomic, ordered steps with clear success
criteria, then executes them one by one with progress tracking.

---

## When to Use

- User gives a **broad goal** that requires multiple steps
- A feature needs changes across **multiple files/layers**
- Complex **refactoring** spanning many files
- **Migration** tasks (database, framework, library)
- Any task that benefits from **systematic decomposition**

---

## Task Decomposition Rules

### 1. Break Down by Layer
```
USER REQUEST: "Add user profile page"

DECOMPOSITION:
  1. Database  → Add profile fields to User schema
  2. Backend   → Create GET/PUT /api/v1/users/:id/profile endpoints
  3. Frontend  → Build ProfilePage component
  4. Testing   → Unit + integration + E2E tests
  5. Polish    → Loading states, error handling, responsive design
```

### 2. Order by Dependencies
Execute in dependency order:
```
1. Schema changes (database migration)
2. Backend service logic
3. API route handlers
4. Backend tests
5. Frontend components
6. Frontend state management
7. Frontend tests
8. E2E tests
9. Documentation
```

### 3. Make Steps Atomic
Each step must:
- ✅ Be completable independently
- ✅ Have a clear "done" condition
- ✅ Not break existing functionality mid-step
- ✅ Be verifiable (run a test, see output, check build)

### 4. Include Verification
Every step has a check:
```
Step: "Add email field validation to register endpoint"
Verify: POST /api/v1/auth/register with invalid email → 400 response
```

---

## Execution Process

```
1. ANALYZE     — Understand the full scope
2. DECOMPOSE   — Break into atomic steps
3. PLAN        — Order by dependency, estimate complexity
4. PRESENT     — Show plan to user, get approval
5. EXECUTE     — Work through steps one by one
6. VERIFY      — Run tests / build after each step
7. REPORT      — Summarize what was done
```

---

## Task Size Categories

| Size | Steps | Time | Example |
|------|-------|------|---------|
| **XS** | 1-2 | < 5 min | Fix a typo, add a CSS class |
| **S** | 3-5 | 5-15 min | Add a field, create a utility |
| **M** | 5-10 | 15-45 min | Build a component, add an endpoint |
| **L** | 10-20 | 45-120 min | Build a feature, add auth |
| **XL** | 20+ | 2+ hours | Full page, new service, major refactor |

For **L** and **XL** tasks, ALWAYS create a plan artifact first.

---

## Progress Tracking Format

```markdown
## Task: Add User Settings Page

- [x] 1. Add settings fields to Prisma schema (theme, language, notifications)
- [x] 2. Create migration and apply
- [x] 3. Create settings.service.js with get/update logic
- [x] 4. Create GET /api/v1/users/:id/settings endpoint
- [x] 5. Create PUT /api/v1/users/:id/settings endpoint
- [x] 6. Add input validation (Zod schema)
- [/] 7. Build SettingsPage React component
  - [x] 7a. Theme selector
  - [x] 7b. Language dropdown
  - [/] 7c. Notification toggles
  - [ ] 7d. Save button with loading state
- [ ] 8. Add integration tests for settings endpoints
- [ ] 9. Add E2E test for settings flow
- [ ] 10. Update API documentation

Progress: 6.5/10 steps (65%)
```

---

## Error Recovery

If a step fails:

1. **Don't panic** — Read the error message
2. **Isolate** — Is it this step or a dependency?
3. **Fix forward** if simple (< 2 min fix)
4. **Rollback** if complex — revert this step, fix the root cause
5. **Update plan** — Add a fix step if needed
6. **Continue** — Resume from the fixed step

---

## Context Awareness

When executing tasks, always consider:

- **Existing patterns** — Follow the project's established conventions
- **Related files** — Check what else might need updating
- **Side effects** — Will this change break other features?
- **Tests** — Are existing tests still passing?
- **Documentation** — Does the README or API docs need updating?
- **Migration** — Is there a database migration needed?

---

## Quality Gates

Before marking any task as complete:

```
CODE QUALITY
- [ ] No linting errors
- [ ] No TypeScript errors (if applicable)
- [ ] Follows existing code style
- [ ] No commented-out code

FUNCTIONALITY
- [ ] Feature works as described
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states shown

TESTING
- [ ] New code has tests
- [ ] Existing tests still passing
- [ ] Build succeeds

DOCUMENTATION
- [ ] Code comments where needed
- [ ] API documentation updated
- [ ] README updated if setup changed
```
