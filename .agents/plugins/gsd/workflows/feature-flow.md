---
description: Build a complete feature end-to-end from database to UI with tests
---

# Feature Flow Workflow

Build a complete feature across all layers — database, backend, frontend, tests —
in a systematic, dependency-ordered flow.

## Steps

1. **Understand the feature**
   - What does the user want?
   - What data is needed? (new tables, fields, relations)
   - What API endpoints are needed? (CRUD operations)
   - What UI is needed? (pages, components, forms)
   - What are the edge cases?

2. **Create a task breakdown**
   Create a `task.md` artifact with all steps marked `[ ]`.
   Order by dependency: database → backend → API → frontend → tests.

3. **Database layer**
   - Add/modify Prisma schema models
   - Create migration: `npx prisma migrate dev --name <feature-name>`
   - Add seed data if needed

4. **Service layer**
   - Create `src/services/<feature>.service.js`
   - Implement business logic functions
   - Add input validation schemas (Zod)
   - Handle error cases

5. **API routes**
   - Create `src/routes/<feature>.routes.js`
   - Wire up routes with auth middleware
   - Add input validation middleware
   - Register in main route index

6. **Backend tests**
   - Unit tests for service logic
   - Integration tests for API endpoints
   - Test happy path + error paths + edge cases

// turbo
7. **Run backend tests**
   ```bash
   npm test
   ```

8. **Frontend components** (if applicable)
   - Create page component
   - Create form components
   - Add API service client functions
   - Wire up state management
   - Add loading/error/empty states

9. **Frontend tests** (if applicable)
   - Component render tests
   - User interaction tests
   - Form validation tests

10. **E2E test** (if applicable)
    - Write Playwright test for the full user flow
    - Test happy path end-to-end

11. **Polish**
    - Review error messages
    - Check responsive design
    - Add loading animations
    - Verify accessibility

12. **Update documentation**
    - Add API docs for new endpoints
    - Update README if needed
    - Update task.md with all items checked

13. **Final verification**
    - All tests passing
    - No lint errors
    - Build succeeds
    - Feature works as expected

14. **Report to user**
    Create walkthrough.md summarizing changes, files modified, and how to test.
