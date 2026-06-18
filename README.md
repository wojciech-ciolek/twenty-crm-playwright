# Twenty CRM – E2E Test Portfolio

Playwright + TypeScript end-to-end test suite for [Twenty CRM](https://github.com/twentyhq/twenty), built to demonstrate production-grade QA automation: Page Objects, GraphQL-based test data management, a custom flaky test tracker, and a staged CI pipeline.

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
npm run dashboard       # generate flaky test HTML dashboard
npm run allure:generate # generate Allure report from allure-results/
npm run allure:open     # open the generated Allure report
```

## Architecture decisions

**Page Objects.** Each bounded screen (login, people list, person detail) is a single class exposing locators and atomic actions only — no assertions. This keeps every selector change confined to one file and keeps spec files readable as a sequence of user-facing steps.

**Fixtures over beforeEach/afterEach.** Setup and teardown live in `fixtures/index.ts` as Playwright fixtures rather than test hooks. Teardown after `await use()` runs even if the test fails, which a plain `afterEach` can't guarantee, and a test that doesn't request a fixture never pays its setup cost.

**GraphQL API helpers for test data.** `helpers/api/` wraps GraphQL mutations (`createPerson` / `deletePerson`) authenticated with the JWT pulled from the session cookie. Fixtures call these directly to set up and tear down records — faster and more reliable than driving the same operations through the UI.

**Session reuse via storageState.** `setup/global-setup.ts` logs in once before the suite runs and saves the session to `storage/auth.json`. Tests opt in with `test.use({ storageState: 'storage/auth.json' })`, so most tests start already authenticated instead of repeating a UI login. Auth tests deliberately skip this — they need a fresh, unauthenticated context to test the login flow itself.

**Typed test data.** All test data lives in `test-data/` as typed interfaces with named constants (e.g. `validUser` in `auth.data.ts`). Renaming or removing a field surfaces as a compile error everywhere it's used, not a silent runtime failure.

**Tagging strategy.** Every test carries `{ tag: '@smoke' }` or `{ tag: '@regression' }`. This lets CI get fast feedback on every push without skipping thorough coverage — it just runs on a different cadence.

**FlakyReporter.** `reporters/flaky.reporter.ts` is a custom Playwright reporter that detects flaky tests — tests that fail at least once but eventually pass within the same run (i.e. passed only after a retry). Results are persisted to `flaky-report/flaky.json` between runs so that flakiness history accumulates over time. Run `npm run dashboard` to generate an HTML dashboard with severity classification, filtering, and sortable columns.

**Allure reporting.** `allure-playwright` is registered alongside the built-in `html` and `list` reporters in both `playwright.config.ts` and `playwright.config.ci.ts`, writing raw results to `allure-results/`. Run `npm run allure:generate` to build the static HTML report into `allure-report/`, then `npm run allure:open` to serve and view it (or `npm run allure:clean` to clear both directories between runs).

## Project structure

```
twenty-crm-tests/
  tests/          # spec files — thin, assertion-focused, grouped by domain (auth/, people/)
  pages/          # Page Objects, one per bounded screen (auth/, people/)
  fixtures/       # custom Playwright fixtures extending base test (index.ts)
  helpers/api/    # GraphQL client + per-entity API helpers for test data setup/teardown
  reporters/       # FlakyReporter + dashboard generator
  flaky-report/    # persisted flaky.json + generated index.html (gitignored)
  allure-results/  # raw Allure results written by allure-playwright (gitignored)
  allure-report/   # generated Allure HTML report (gitignored)
  config/         # URLs and env config (urls.ts)
  test-data/      # typed interfaces + constants, one file per domain
  setup/          # global-setup.ts — runs once before all tests, saves storage/auth.json
  storage/        # auth.json — saved session state, gitignored
  playwright.config.ts
  .github/workflows/e2e.yml
```

## CI/CD

The pipeline is designed around a **smoke gate** — fast, critical-path tests block every push before the slower regression suite runs. This keeps PR feedback under 2 minutes while still running thorough coverage on every merge.

`.github/workflows/e2e.yml` runs two jobs against a Twenty CRM service container:

| Trigger | Job | Tests | Artifacts retained |
|---|---|---|---|
| Every push / PR to main | `smoke` | `@smoke` only | 7 days |
| Push to main | `smoke` → `regression` | all tests | 14 days |
| Nightly (02:00 UTC) | `smoke` → `regression` | all tests | 14 days |
| Manual (`workflow_dispatch`) | `smoke`, `regression`, or `both` | selected | per job |

> **Note:** `regression` declares `needs: smoke` — it only starts after smoke passes. When triggered via `workflow_dispatch` with `job: regression`, smoke is skipped and regression runs directly.

**Key decisions:**

- **Service container over external environment** – Twenty CRM runs as a Docker service container inside the GitHub Actions job. No external staging environment, no secrets beyond test credentials, no flakiness from shared state between runs.

- **`needs: smoke` on regression** – regression only starts after smoke passes. A broken critical path fails fast without burning the full suite run time or cluttering the artifact history with a useless regression report.

- **Nightly run** – catches regressions introduced by dependency updates, Docker image changes, or time-dependent bugs that wouldn't surface on a push-triggered run.

- **`workflow_dispatch` with job selector** – allows manually triggering smoke, regression, or both. Useful for validating a fix without waiting for a scheduled run or pushing a dummy commit.

- **Reports as artifacts** – HTML reports are uploaded after every run (`if: always()`), so failures are debuggable even when the job itself is gone. Smoke reports expire after 7 days; regression after 14.

> **Local vs CI:** The workflow is designed for a hosted environment where Twenty CRM credentials are stored as GitHub secrets. To run the full suite locally, start Twenty via Docker and configure `.env` as described in Quick start.

## Test coverage

| Area | Scenario | Tag |
|---|---|---|
| Auth | Log in with valid credentials | `@smoke` |
| Auth | Invalid password shows an error | `@regression` |
| Auth | Sign-up attempt with a non-existent email is blocked | `@regression` |
| People | Person created via API appears in the list | `@smoke` |
| People | Person detail page loads with fields container | `@smoke` |
| People | Person first name can be edited inline | `@regression` |