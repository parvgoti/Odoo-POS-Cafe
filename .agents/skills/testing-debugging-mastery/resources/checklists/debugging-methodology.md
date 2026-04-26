# Testing & Debugging Mastery — Debugging Methodology

Systematic approaches for finding and fixing bugs fast.

---

## The SCREAM Method

### S — SYMPTOMS
**What exactly is happening?**

Be precise. Not "it's broken" — describe:
- What did you expect to happen?
- What actually happened instead?
- What error message (exact text)?
- What HTTP status code?
- What browser/device/OS?
- What user account (if relevant)?

**Example:**
> ❌ "Login doesn't work"
> ✅ "POST /api/auth/login returns 500 when the email contains a '+' symbol. Works fine for normal emails."

### C — CONTEXT
**When did it start? What changed?**

- [ ] Was it ever working? When did it stop?
- [ ] Was there a recent deployment?
- [ ] Was there a dependency update?
- [ ] Was there a configuration change?
- [ ] Was there a database migration?
- [ ] Was there a third-party service outage?
- [ ] Does it happen in all environments or just one?

### R — REPRODUCE
**Can you reliably trigger it?**

Write exact reproduction steps:
```
1. Open browser at /login
2. Enter email: test+special@example.com
3. Enter password: Password123!
4. Click "Sign In"
5. Observe: 500 error instead of redirect
```

If NOT reproducible:
- Add detailed logging
- Check if it's timing/race condition dependent
- Check if it's data dependent
- Check if it's environment dependent

### E — EXAMINE
**Look at the evidence.**

Check IN ORDER:
1. **Error message** — Read it. Really read it.
2. **Stack trace** — Which file and line?
3. **Request/Response** — Network tab, cURL, logs
4. **Server logs** — What happened on the backend?
5. **Database state** — Is the data correct?
6. **Environment variables** — Are they set correctly?
7. **Recent changes** — `git log -5`, `git diff HEAD~1`

### A — ASSUMPTIONS
**List what you THINK is true. Verify each one.**

| Assumption | Verified? | Result |
|-----------|-----------|--------|
| "Database is connected" | ☐ | |
| "Env var is set correctly" | ☐ | |
| "This function receives a string" | ☐ | |
| "The API returns JSON" | ☐ | |
| "This path is hit" | ☐ | |

**The bug is often in an assumption you didn't verify.**

### M — MINIMIZE
**Create the smallest reproduction.**

1. Remove everything unrelated
2. Hardcode inputs instead of using real data
3. Test each piece in isolation
4. Binary search: comment out half the code at a time

---

## Common Debugging Commands

### Node.js
```bash
# Debug with Chrome DevTools
node --inspect src/server.js
node --inspect-brk src/server.js    # Break on first line

# Debug tests
npx vitest --inspect-brk --single-thread

# Memory analysis
node --max-old-space-size=512 --inspect src/server.js
# → Chrome DevTools → Memory → Take Heap Snapshot

# CPU profiling
node --prof src/server.js
node --prof-process isolate-*.log > profile.txt

# Check event loop lag
node -e "
  const start = process.hrtime.bigint();
  setInterval(() => {
    const delta = Number(process.hrtime.bigint() - start) / 1e6;
    console.log('Event loop lag:', delta.toFixed(1), 'ms');
    start = process.hrtime.bigint();
  }, 1000);
"
```

### Database
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Find slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Missing indexes (seq scans on large tables)
SELECT relname, seq_scan, idx_scan,
  CASE WHEN seq_scan > 0 THEN round(100.0 * idx_scan / (seq_scan + idx_scan), 2)
  ELSE 100 END AS idx_pct
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC;
```

### Docker
```bash
# Container logs
docker logs app --tail 100 -f
docker compose logs -f app

# Shell into container
docker exec -it app sh

# Resource usage
docker stats --no-stream

# Check container health
docker inspect app | jq '.[0].State.Health'

# Network debugging
docker exec -it app ping postgres
docker exec -it app curl http://localhost:3000/health
```

### Network / API
```bash
# Test API endpoint
curl -v -X POST https://api.example.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}'

# Check response headers
curl -I https://example.com

# DNS resolution
dig example.com
nslookup example.com

# SSL certificate check
openssl s_client -connect example.com:443 -servername example.com

# Port check
nc -zv localhost 3000
```

---

## Bug Category Quick Reference

| Category | Symptoms | First Check |
|----------|----------|------------|
| **Null/Undefined** | "Cannot read property X of undefined" | Optional chaining `?.`, data existence |
| **Type Coercion** | "1" + 1 = "11", wrong comparisons | `===` vs `==`, explicit parseInt |
| **Async/Await** | Stale data, unhandled promises | Missing `await`, Promise.all order |
| **Race Condition** | "Sometimes works" | Timing, shared state, concurrent writes |
| **Memory Leak** | Growing memory, crashes over time | Event listeners, intervals, closures |
| **CORS** | Works in Postman, fails in browser | Server CORS config, preflight |
| **Auth** | 401/403 errors | Token expiry, permissions, middleware order |
| **Timezone** | Dates off by hours | UTC in backend, local in frontend only |
| **Off-by-One** | Missing first/last item | `<` vs `<=`, 0-indexed |
| **Encoding** | Garbled text, mojibake | UTF-8 everywhere, URL encoding |
| **Connection** | ECONNREFUSED, timeout | Service running? Port correct? Firewall? |
| **Import** | Module not found | Path correct? Package installed? ESM vs CJS? |

---

## Debugging Mindset Rules

1. **Read the error message.** The answer is often right there.
2. **Question your assumptions.** Add `console.log` to verify.
3. **Bisect the problem.** Binary search through code/commits.
4. **Simplify the reproduction.** Fewer variables = faster fix.
5. **Check what changed.** `git diff`, recent deploys, new dependencies.
6. **Rubber duck it.** Explain the problem out loud (or in writing).
7. **Take a break.** Fresh eyes find bugs faster than tired ones.
8. **Don't fix symptoms.** Find and fix the root cause.
9. **Write a test.** Before fixing, write a test that reproduces the bug.
10. **Document the fix.** Future-you will thank present-you.
