---
description: Review code for bugs, security issues, performance, and best practices
---

# Code Review Workflow

Perform a thorough code review that catches real issues — not just style nits.

## Steps

1. **Understand scope**
   - What files were changed?
   - What is the purpose of the change?
   - Is there a linked issue/ticket?

2. **Read the diff**
   Review all changed files:
   ```bash
   git diff main...HEAD --stat
   git diff main...HEAD
   ```

3. **Check for critical issues first**

   🔴 **Security scan:**
   - SQL injection (string concatenation in queries)
   - XSS (unescaped user input in HTML)
   - Auth bypass (missing auth middleware)
   - Hardcoded secrets (API keys, passwords)
   - IDOR (accessing other users' data)
   - Missing input validation

4. **Check for bugs**

   🟡 **Logic issues:**
   - Off-by-one errors
   - Null/undefined access without checks
   - Missing await on async functions
   - Race conditions in concurrent code
   - Missing error handling (uncaught promises)
   - Type coercion bugs (== vs ===)

5. **Check for performance**

   🟡 **Performance issues:**
   - N+1 database queries
   - Missing database indexes
   - Unbounded queries (no LIMIT)
   - Memory leaks (event listeners, intervals)
   - Unnecessary re-renders (React)
   - Large payloads in API responses

6. **Check for maintainability**

   🟢 **Code quality:**
   - Functions > 50 lines (should be split)
   - Deep nesting > 3 levels
   - Magic numbers/strings (should be constants)
   - Duplicated code (DRY violations)
   - Poor naming
   - Missing error messages
   - Dead/commented-out code

7. **Check tests**
   - New code has tests?
   - Tests cover happy path AND error paths?
   - Tests are meaningful (not just "no error")?
   - Existing tests still pass?

8. **Produce review report**
   Use the code-reviewer skill format:
   - Group findings by severity: 🔴 Critical → 🟡 Warning → 🟢 Suggestion
   - For each finding: file, line, issue, fix, explanation
   - Summary table with counts
   - Verdict: ✅ Approved / ❌ Changes Requested

9. **If issues found**
   - Create task.md with fixes needed
   - Apply fixes if user approves
   - Re-run tests after fixes

10. **Final approval**
    ```
    ✅ Code Review Complete
    - Security: Pass
    - Performance: Pass
    - Tests: Pass
    - Quality: Pass
    ```
