# Twenty CRM – E2E Test Portfolio

Playwright + TypeScript test suite for [Twenty CRM](https://github.com/twentyhq/twenty) – an open-source CRM with 20k+ GitHub stars.

**Why Twenty CRM?** It uses a modern stack (React, GraphQL, NestJS), ships with `data-testid` attributes on most UI elements, and can be spun up locally in minutes via Docker. That makes it an ideal target for demonstrating realistic QA automation patterns without NDA concerns.

---

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/your-username/twenty-crm-playwright.git
cd twenty-crm-playwright
npm install
npx playwright install chromium

# 2. Start Twenty CRM locally
git clone https://github.com/twentyhq/twenty.git
cd twenty/packages/twenty-docker && cp .env.example .env
docker compose up -d
# app available at http://localhost:3000

# 3. Configure credentials
cp .env.example .env
# edit .env with your test user's credentials

# 4. Run tests
npm run test:smoke      # fast critical-path tests (~60 s)
npm run test            # full suite
npm run test:headed     # watch the browser
```

---

## Project structure

```
tests/          ← test files (.spec.ts) – thin, readable, assert-focused
pages/          ← Page Objects and Step Objects
flows/          ← reusable async sequences (login, create record…)
fixtures/       ← custom Playwright fixtures (extend base `test`)
helpers/        ← low-level UI and API utilities
config/         ← URLs and environment config
test-data/      ← typed test data (interfaces + constants)
.github/        ← CI/CD workflow (smoke on every push, regression nightly)
```

---

## Architectural decisions

### 1. Page Object vs Step Object – knowing when to use each

**Page Object** is the right abstraction for a *single, bounded screen* where all elements are visible simultaneously and user interaction is non-sequential. `LoginPage` is a textbook example: two inputs, one button, one error state.

**Step Object** fits a *multi-step wizard or modal* where each stage reveals new fields and has its own validation. `CreateContactSteps` maps to Twenty's contact creation modal: the first step captures the name, subsequent steps optionally add email, phone, and company. Collapsing all of that into one Page Object would expose 10+ methods that are only valid at specific stages, making the API misleading.

The decision rule: if the UI has distinct stages with their own "next" action, use Steps. If it's a single view, use a Page Object.

### 2. Fixtures instead of beforeEach/afterEach

Playwright fixtures are the idiomatic replacement for `beforeEach`/`afterEach` pairs. Three concrete reasons this project uses them:

**Guaranteed cleanup.** Fixture teardown (the code after `await use()`) runs even when a test throws, unlike `afterEach` which can be skipped by certain failure modes.

**Composability.** The `authenticatedPage` fixture builds on top of `page` transparently. Adding a new `pageWithSeededContact` fixture is a one-liner that depends on `authenticatedPage` – no new hooks needed.

**Laziness.** A test that doesn't declare `authenticatedPage` in its parameters never pays the login cost. With `beforeEach`, every test in the block runs setup regardless.

### 3. Flow pattern for reusable multi-page sequences

A Flow is a plain async function that accepts a `Page` and performs a user journey spanning multiple pages or UI states. `loginFlow` is the simplest example.

Flows exist between Page Objects (which own a single page's locators) and tests (which own assertions). They are the right home for setup sequences that would otherwise be copy-pasted between tests.

A Flow can be called from a fixture (most common), from another Flow, or directly in a test when fine-grained control is needed.

### 4. Inline cleanup instead of afterEach

Tests that create records clean them up in the same test body. This is intentional:

- The full record lifecycle (create → assert → delete → assert) is visible in one place.
- There's no shared mutable state between a test body and a hook.
- If creation fails, the cleanup path is never reached – which is correct, because there's nothing to clean up.

### 5. Typed test data

All test data lives in `test-data/` as typed TypeScript interfaces with named constants. Benefits:

- TypeScript catches mismatches between test data shape and Page Object method signatures at compile time.
- Renaming a field causes a compile error everywhere it's used, not a silent test failure.
- `invalidCredentials` is an array of `UserCredentials` objects, enabling data-driven parametric tests without a third-party library.

### 6. Tagging strategy

Every test carries one of:

- `@smoke` – critical-path tests that must pass on every push (≤ 2 minutes total)
- `@regression` – thorough coverage run on PR merge and nightly

CI runs smoke first; regression only runs if smoke is green. This keeps the PR feedback loop under 3 minutes while still catching edge cases overnight.

---

## CI/CD

GitHub Actions workflow at `.github/workflows/e2e.yml`:

| Event | Job | Tests |
|---|---|---|
| Every push | `smoke` | `@smoke` only |
| PR to main | `smoke` | `@smoke` only |
| Push to main | `smoke` → `regression` | All tests |
| Nightly (02:00 UTC) | `smoke` → `regression` | All tests |

Test reports are uploaded as artifacts and retained for 7 days (smoke) or 14 days (regression).

---

## Planned test coverage

| Area | Status |
|---|---|
| Auth – login (valid credentials) | ✅ |
| Auth – login (invalid credentials, parametric) | ✅ |
| Auth – logout + protected route redirect | ✅ |
| Contacts – create | ✅ |
| Contacts – edit | ✅ |
| Contacts – delete | ✅ |
| Companies – create / edit / delete | 🔜 |
| Pipeline – create deal, change status | 🔜 |
| API helpers for test data setup | 🔜 |

---

## Running in CI without Docker

The workflow uses GitHub Actions service containers to spin up Twenty CRM automatically. No manual setup required – a fresh clone and `gh workflow run e2e.yml` is enough.

For local runs, Twenty must be running at `http://localhost:3000` (see Quick start above).
