# Twenty CRM – E2E Test Portfolio

Playwright + TypeScript end-to-end test suite for [Twenty CRM](https://github.com/twentyhq/twenty), built to demonstrate production-grade QA automation: Page Objects, GraphQL-based test data management, and a staged CI pipeline.

## Why Twenty CRM

Twenty is open source, built on a modern stack (React, GraphQL, NestJS), ships with `data-testid` attributes on most UI elements, and runs locally via Docker in minutes. That makes it a realistic target for demonstrating automation patterns against a production-shaped app — without any NDA constraints tied to a real employer's codebase.

## Quick start

```bash
# 1. Run Twenty CRM locally
git clone https://github.com/twentyhq/twenty.git
cd twenty/packages/twenty-docker && cp .env.example .env
docker compose up -d
# Twenty is now running at http://localhost:3000 — sign up a test user there

# 2. Install this suite
cd twenty-crm-tests
npm install
npx playwright install chromium

# 3. Configure test credentials
cp .env.example .env
# fill in BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD

# 4. Run tests
npm run test:smoke      # critical path, ~60s
npm test                # full suite
npm run test:headed     # watch the browser
```

## Architecture decisions

**Page Objects.** Each bounded screen (login, people list, person detail) is a single class exposing locators and atomic actions only — no assertions. This keeps every selector change confined to one file and keeps spec files readable as a sequence of user-facing steps.

**Fixtures over beforeEach/afterEach.** Setup and teardown live in `fixtures/index.ts` as Playwright fixtures rather than test hooks. Teardown after `await use()` runs even if the test fails, which a plain `afterEach` can't guarantee, and a test that doesn't request a fixture never pays its setup cost.

**GraphQL API helpers for test data.** `helpers/api/` wraps GraphQL mutations (`createPerson` / `deletePerson`) authenticated with the JWT pulled from the session cookie. Fixtures call these directly to set up and tear down records, which is faster and more reliable than driving the same operations through the UI.

**Session reuse via storageState.** `setup/global-setup.ts` logs in once before the suite runs and saves the session to `storage/auth.json`. Tests opt in with `test.use({ storageState: 'storage/auth.json' })`, so most tests start already authenticated instead of repeating a UI login.

**Typed test data.** All test data lives in `test-data/` as typed interfaces with named constants (e.g. `validUser` in `auth.data.ts`). Renaming or removing a field surfaces as a compile error everywhere it's used, not a silent runtime failure.

**Tagging strategy.** Every test carries `{ tag: '@smoke' }` or `{ tag: '@regression' }`. This lets CI get fast feedback on every push without skipping thorough coverage — it just runs on a different cadence.

## Project structure

```
twenty-crm-tests/
  tests/          # spec files — thin, assertion-focused, grouped by domain (auth/, people/)
  pages/          # Page Objects, one per bounded screen (auth/, people/)
  fixtures/       # custom Playwright fixtures extending base test (index.ts)
  helpers/api/    # GraphQL client + per-entity API helpers for test data setup/teardown
  config/         # URLs and env config (urls.ts)
  test-data/      # typed interfaces + constants, one file per domain
  setup/          # global-setup.ts — runs once before all tests, saves storage/auth.json
  storage/        # auth.json — saved session state, gitignored
  playwright.config.ts
  .github/workflows/e2e.yml
```

## CI/CD

GitHub Actions runs two jobs against a Twenty CRM service container (`.github/workflows/e2e.yml`):

| Trigger | Job | Tests |
|---|---|---|
| Every push / PR to main | `smoke` | `@smoke` only |
| Push to main | `smoke` → `regression` | all tests |
| Nightly (02:00 UTC) | `smoke` → `regression` | all tests |

`regression` only runs after `smoke` passes, so a broken critical path fails fast without burning a full regression run. Reports are uploaded as artifacts (7 days for smoke, 14 for regression).

## Test coverage

| Area | Scenario | Tag |
|---|---|---|
| Auth | Log in with valid credentials | `@smoke` |
| Auth | Invalid password shows an error | `@regression` |
| Auth | Sign-up attempt with a non-existent email is blocked | `@regression` |
| People | A person created via the API appears in the list | `@smoke` |
