---
name: code-reviewer
description: >
  Automated code review skill that analyzes code for bugs, security vulnerabilities,
  performance issues, best practice violations, and maintainability problems. Provides
  actionable feedback with severity levels, fix suggestions, and links to best practices.
  Use when reviewing PRs, auditing code quality, or improving existing codebases.
---

# Code Reviewer Skill

Perform thorough, automated code reviews that catch real bugs, security issues,
and quality problems — not just style nits. Produces actionable, prioritized
feedback that developers can immediately act on.

---

## When to Use

- Reviewing a **pull request** or code change
- **Auditing** an existing codebase for quality
- Checking for **security vulnerabilities**
- Finding **performance bottlenecks**
- Ensuring code follows **established patterns**
- Preparing code for **production deployment**

---

## Review Process

### Step 1: Understand Context
Before reviewing code, understand:
- What is the feature/fix supposed to do?
- What files were changed?
- Is there a ticket/issue describing the requirements?

### Step 2: Review Checklist

#### 🔴 Critical (Must Fix Before Merge)

**Security**
- [ ] SQL injection: Are queries parameterized? (No string concatenation)
- [ ] XSS: Is user input sanitized before rendering?
- [ ] Auth bypass: Are all protected routes checking auth middleware?
- [ ] Secrets: Are API keys, passwords, tokens hardcoded?
- [ ] IDOR: Can users access/modify other users' resources?
- [ ] Path traversal: Is file path input validated?
- [ ] Mass assignment: Is input filtered before database write?

**Data Integrity**
- [ ] Race conditions: Concurrent writes to same resource?
- [ ] Missing transactions: Multi-step DB operations need atomicity?
- [ ] Unvalidated input: Is Zod/joi validation on every endpoint?
- [ ] Missing error handling: What happens when this throws?

#### 🟡 Warning (Should Fix)

**Performance**
- [ ] N+1 queries: Are related records fetched in loops?
- [ ] Missing indexes: Are query-filtered columns indexed?
- [ ] Unbounded queries: Is there a LIMIT on all SELECTs?
- [ ] Memory leaks: Event listeners cleaned up? Intervals cleared?
- [ ] Large payloads: Is unnecessary data being returned?
- [ ] Missing caching: Repeated expensive operations?

**Maintainability**
- [ ] God functions: Any function > 50 lines?
- [ ] Deep nesting: More than 3 levels of if/else?
- [ ] Magic numbers: Unexplained hardcoded values?
- [ ] Dead code: Commented-out code or unreachable paths?
- [ ] Missing types: TypeScript `any` or implicit types?
- [ ] Poor naming: Abbreviations, single-letter variables?

#### 🟢 Suggestion (Nice to Have)

**Best Practices**
- [ ] DRY: Is there duplicated logic that could be extracted?
- [ ] Error messages: Are they helpful for debugging?
- [ ] Logging: Are key operations logged with context?
- [ ] Constants: Are repeated strings/numbers extracted?
- [ ] Comments: Does complex logic have explanation?
- [ ] Tests: Is the new code tested?

### Step 3: Provide Feedback

Format each finding as:

```
🔴 CRITICAL | security/sql-injection
File: src/services/user.service.js:45
Issue: Raw SQL query with string interpolation — SQL injection vulnerability

  const user = await db.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`);

Fix: Use parameterized query
  const user = await db.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

Why: An attacker could inject malicious SQL via the email field, potentially
     exposing or deleting all data in the database.
```

### Step 4: Summary

End with a summary:

```markdown
## Review Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟡 Warning | 5 |
| 🟢 Suggestion | 3 |

### Verdict: ❌ Changes Requested
Critical security issues must be resolved before merging.

### Top Priorities
1. Fix SQL injection in user.service.js
2. Add input validation on POST /api/users
3. Add missing auth middleware on DELETE endpoint
```

---

## Review Patterns by File Type

### API Routes
Check: auth middleware, input validation, error handling, status codes, rate limiting

### Database Queries
Check: N+1, missing indexes, transactions, connection leaks, raw SQL safety

### React Components
Check: key props, useEffect cleanup, memo for expensive renders,
       accessibility (labels, roles, alt text), error boundaries

### Configuration
Check: secrets not hardcoded, env vars validated, defaults reasonable,
       production vs development differences

### Tests
Check: meaningful assertions (not just "no error"), edge cases, isolation,
       no flaky patterns (timeouts, order dependency)

---

## Severity Levels

| Level | Icon | Meaning | Action |
|-------|------|---------|--------|
| Critical | 🔴 | Security vulnerability, data loss risk, crash | Must fix before merge |
| Warning | 🟡 | Bug risk, performance issue, tech debt | Should fix this PR |
| Suggestion | 🟢 | Improvement, style, readability | Consider for future |
| Note | 💬 | Question, discussion, learning | No action required |

---

## Auto-Fix Patterns

When possible, provide the exact fix code, not just the problem description.
The developer should be able to copy-paste the fix directly.

```diff
- const result = data.filter(x => x.active == true);
+ const result = data.filter(x => x.active === true);
```

```diff
- app.get('/admin/users', getUsers);
+ app.get('/admin/users', requireAuth, requireRole('ADMIN'), getUsers);
```

```diff
- const users = await db.user.findMany();
+ const users = await db.user.findMany({ take: 100 });
```
