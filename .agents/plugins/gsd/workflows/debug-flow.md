---
description: Systematically debug and fix an issue using the SCREAM methodology
---

# Debug Flow Workflow

Systematic approach to finding and fixing bugs quickly.
Uses the SCREAM method from the testing-debugging-mastery skill.

## Steps

1. **Gather symptoms**
   Ask the user:
   - What is happening? (exact error message, status code)
   - What did you expect to happen?
   - When did it start? (after deploy? after code change?)
   - Can you reproduce it reliably?
   - What browser/device/environment?

2. **Check context**
   - Review recent changes: `git log -5 --oneline`
   - Check for recent dependency updates: `git diff HEAD~5 package-lock.json`
   - Check environment: `node -v`, `npm -v`, `docker ps`
   - Check server logs for errors

3. **Reproduce the issue**
   - Follow exact steps the user described
   - Add `console.log` or breakpoints at suspicious locations
   - Check browser console (frontend) or server logs (backend)
   - Check network tab for API request/response

4. **Examine the evidence**
   - Read the FULL error message and stack trace
   - Identify the file and line number
   - Check the data flow: input → processing → output
   - Look at the database state if relevant

5. **List and verify assumptions**
   Create a checklist:
   ```
   - [ ] Database is connected
   - [ ] Environment variables are set
   - [ ] This code path is actually reached
   - [ ] The input data is what I expect
   - [ ] The dependency is the correct version
   ```
   Verify each one with logging or inspection.

6. **Minimize the reproduction**
   - Remove unrelated code
   - Hardcode test inputs
   - Test the function in isolation
   - Binary search: comment out half the code

7. **Write a failing test**
   Before fixing, write a test that reproduces the bug:
   ```javascript
   it('should handle email with + symbol', async () => {
     // This test should FAIL before the fix
     const result = await loginUser('test+special@example.com', 'password');
     expect(result.status).toBe(200);
   });
   ```

8. **Fix the issue**
   - Make the smallest possible change
   - Don't fix symptoms — fix the root cause
   - Consider: will this fix cause other issues?

// turbo
9. **Verify the fix**
   ```bash
   npm test
   ```

10. **Check for similar issues elsewhere**
    - Search codebase for the same pattern
    - Fix other occurrences of the same bug
    - Add defensive code if needed

11. **Document the fix**
    - Comment explaining WHY the fix was needed
    - Update any relevant documentation
    - Create walkthrough.md if it was a complex bug

12. **Report to user**
    Explain:
    - Root cause: what was wrong
    - Fix: what was changed
    - Prevention: how to avoid this in the future
