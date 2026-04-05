# Testing & Debugging Mastery — Test Quality Checklist

Use this checklist to audit your test suite.

---

## Test File Structure — Each Test File

- [ ] Tests are grouped in `describe` blocks by feature/function
- [ ] Each `it` block tests ONE behavior
- [ ] Test descriptions read like sentences: "it should X when Y"
- [ ] Arrange-Act-Assert (AAA) pattern is followed
- [ ] Setup/teardown in `beforeEach`/`afterEach` (not duplicated)
- [ ] No shared mutable state between tests
- [ ] No `.only` or `.skip` left in committed code

---

## Test Quality

### Unit Tests
- [ ] Pure functions have 90%+ coverage
- [ ] Edge cases tested: null, undefined, empty, boundary values
- [ ] Error paths tested (invalid input, thrown errors)
- [ ] `it.each` used for multiple similar test cases
- [ ] Mocks reset between tests (`vi.restoreAllMocks()`)
- [ ] Only external boundaries are mocked (DB, APIs, filesystem)
- [ ] Snapshot tests used sparingly (only for stable outputs)

### Integration Tests
- [ ] API endpoints tested with real database (test DB)
- [ ] Request + response contract verified
- [ ] Status codes verified (200, 201, 400, 401, 403, 404, 409, 429)
- [ ] Validation errors tested (missing fields, invalid data)
- [ ] Auth/authz tested (no token, expired token, wrong role)
- [ ] Pagination tested (page, limit, hasNext, hasPrev)
- [ ] Database state cleaned between tests

### E2E Tests
- [ ] Core user journeys covered (register → login → action → logout)
- [ ] Forms tested (submit, validation errors, keyboard nav)
- [ ] Error states visible to user (404, server error)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] No hardcoded waits (`page.waitForTimeout`) — use assertions
- [ ] Selectors use roles/labels, not CSS classes or test IDs
- [ ] Tests independent (no order dependency)

### React Component Tests
- [ ] Rendered output tested (text, structure)
- [ ] User interactions tested (click, type, select)
- [ ] Loading/error/empty states tested
- [ ] Callback props verified (onSubmit, onChange, onDelete)
- [ ] Accessibility basics checked (labels, roles, aria)
- [ ] No implementation details tested (state, context internals)
- [ ] `userEvent` used instead of `fireEvent`

---

## Test Infrastructure

- [ ] Test framework configured (vitest.config.js or jest.config.js)
- [ ] Setup file cleans mocks between tests
- [ ] Path aliases work in tests (`@/`, `@tests/`)
- [ ] Coverage thresholds set (≥ 80% lines, ≥ 75% branches)
- [ ] Coverage excludes non-logic files (types, config, index)
- [ ] CI pipeline runs tests automatically
- [ ] CI fails on coverage threshold drop
- [ ] Test database seed/cleanup automated
- [ ] E2E config has proper timeouts and retries for CI
- [ ] Test reports generated (HTML, JUnit XML)

---

## Mocking Quality

- [ ] External services mocked (email, payment, storage)
- [ ] Database NOT mocked in integration tests
- [ ] Mock return values match real API shapes
- [ ] MSW or similar used for HTTP mocking (not fetch patches)
- [ ] Timers mocked with `vi.useFakeTimers()` (not real delays)
- [ ] Environment variables stubbed with `vi.stubEnv()`
- [ ] Factory functions used for test data (not hardcoded)

---

## Common Mistakes (Red Flags)

- ⚠️ Test that always passes (assertion on wrong variable)
- ⚠️ Multiple assertions but unclear what's being tested
- ⚠️ Long test with no comments on what each section does
- ⚠️ Copy-pasted test blocks (use factories or `it.each`)
- ⚠️ Tests that depend on execution order
- ⚠️ Tests that fail when run alone but pass in suite (or vice versa)
- ⚠️ Console.log left in test files
- ⚠️ Test files without any assertion (just calling functions)
- ⚠️ Snapshot files never reviewed (auto-updated blindly)
- ⚠️ Ignoring flaky tests instead of fixing them

---

## Score Card

| Category | Items | ✅ Done | Score |
|----------|-------|---------|-------|
| Test File Structure | 7 | /7 | % |
| Unit Tests | 7 | /7 | % |
| Integration Tests | 7 | /7 | % |
| E2E Tests | 7 | /7 | % |
| React Components | 7 | /7 | % |
| Infrastructure | 10 | /10 | % |
| Mocking Quality | 7 | /7 | % |
| **TOTAL** | **52** | **/52** | **%** |

**Target: ≥ 80% for production-ready test suite.**
