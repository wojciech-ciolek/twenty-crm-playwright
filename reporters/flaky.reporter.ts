import * as fs from 'fs';
import * as path from 'path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

interface FlakyEntry {
    title: string;
    file: string;
    project: string;
    occurrences: number;
    firstSeen: string;
    lastSeen: string;
    runUrls: string[];
}

interface FlakyDatabase {
    updated: string;
    entries: FlakyEntry[];
}

/**
 * FlakyReporter – custom Playwright reporter that tracks flaky tests across runs.
 *
 * A test is considered flaky when it fails at least once and then passes
 * within the same run (i.e. it passed only after a retry).
 *
 * Results are persisted to a JSON file between runs so that flakiness
 * history accumulates over time. Use generate-dashboard.ts to render
 * the JSON into an HTML dashboard.
 *
 * Configuration (via constructor options or environment variables):
 *   dbPath   – path to the JSON database  (default: flaky-report/flaky.json)
 *   runUrl   – URL of the CI report for this run, stored alongside each entry
 */
class FlakyReporter implements Reporter {
    private readonly dbPath: string;
    private readonly runUrl: string;

    private readonly failedTests = new Set<string>();
    private readonly passedAfterRetry = new Set<string>();
    private readonly testMeta = new Map<string, { title: string; file: string; project: string }>();

    constructor(options: { dbPath?: string; runUrl?: string } = {}) {
        this.dbPath = options.dbPath ?? process.env.FLAKY_DB_PATH ?? 'flaky-report/flaky.json';
        this.runUrl = options.runUrl ?? process.env.PLAYWRIGHT_REPORT_URL ?? '';
    }

    onBegin(): void {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const key = this.buildKey(test);

        this.testMeta.set(key, {
            title: test.title,
            file: test.location.file.replace(process.cwd() + '/', ''),
            project: test.parent.project()?.name ?? 'default',
        });

        if (result.status === 'failed' || result.status === 'timedOut') {
            this.failedTests.add(key);
        }

        if (result.status === 'passed' && this.failedTests.has(key)) {
            this.passedAfterRetry.add(key);
        }
    }

    onEnd(): void {
        const flakyKeys = [...this.passedAfterRetry].filter((k) => this.failedTests.has(k));

        if (flakyKeys.length === 0) {
            console.log('[FlakyReporter] No flaky tests detected in this run.');
            return;
        }

        const db = this.loadDatabase();
        const now = new Date().toISOString();

        for (const key of flakyKeys) {
            const meta = this.testMeta.get(key)!;
            const existing = db.entries.find(
                (e) => e.title === meta.title && e.file === meta.file && e.project === meta.project,
            );

            if (existing) {
                existing.occurrences += 1;
                existing.lastSeen = now;
                if (this.runUrl && !existing.runUrls.includes(this.runUrl)) {
                    existing.runUrls = [...existing.runUrls, this.runUrl].slice(-10);
                }
            } else {
                db.entries.push({
                    title: meta.title,
                    file: meta.file,
                    project: meta.project,
                    occurrences: 1,
                    firstSeen: now,
                    lastSeen: now,
                    runUrls: this.runUrl ? [this.runUrl] : [],
                });
            }
        }

        db.entries.sort((a, b) => b.occurrences - a.occurrences);
        db.updated = now;

        fs.writeFileSync(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`[FlakyReporter] Recorded ${flakyKeys.length} flaky test(s) → ${this.dbPath}`);
    }

    private buildKey(test: TestCase): string {
        return `${test.location.file}::${test.title}::${test.parent.project()?.name ?? 'default'}`;
    }

    private loadDatabase(): FlakyDatabase {
        if (fs.existsSync(this.dbPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.dbPath, 'utf-8')) as FlakyDatabase;
            } catch {
                console.warn('[FlakyReporter] Could not parse existing database – starting fresh.');
            }
        }
        return { updated: new Date().toISOString(), entries: [] };
    }
}

export default FlakyReporter;
