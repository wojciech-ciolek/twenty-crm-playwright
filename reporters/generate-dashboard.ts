import * as fs from 'fs';
import * as path from 'path';

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

const dbPath = process.argv[2] ?? 'flaky-report/flaky.json';
const outputPath = process.argv[3] ?? 'flaky-report/index.html';

if (!fs.existsSync(dbPath)) {
    console.error(`[generate-dashboard] Database not found: ${dbPath}`);
    process.exit(1);
}

const db: FlakyDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const { entries } = db;

const updatedDate = new Date(db.updated).toLocaleString('en-GB', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'short',
});

function severityClass(n: number): string {
    if (n >= 10) return 'severity-critical';
    if (n >= 5) return 'severity-high';
    if (n >= 2) return 'severity-medium';
    return 'severity-low';
}

function severityLabel(n: number): string {
    if (n >= 10) return 'Critical';
    if (n >= 5) return 'High';
    if (n >= 2) return 'Medium';
    return 'Low';
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        timeZone: 'UTC',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

const totalOccurrences = entries.reduce((sum, e) => sum + e.occurrences, 0);
const criticalCount = entries.filter((e) => e.occurrences >= 10).length;
const highCount = entries.filter((e) => e.occurrences >= 5 && e.occurrences < 10).length;

const rows = entries
    .map((e, i) => {
        const sevClass = severityClass(e.occurrences);
        const runLinks = e.runUrls
            .map(
                (url, j) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="run-link">#${j + 1}</a>`,
            )
            .join('');

        return `<tr class="row"
      data-title="${e.title.toLowerCase()}"
      data-file="${e.file.toLowerCase()}"
      data-sev="${severityLabel(e.occurrences).toLowerCase()}"
      data-occurrences="${e.occurrences}"
      data-lastseen="${e.lastSeen}">
      <td class="cell cell--rank">${i + 1}</td>
      <td class="cell">
        <div class="test-title">${e.title}</div>
        <div class="test-file">${e.file}</div>
      </td>
      <td class="cell"><span class="badge badge--project">${e.project}</span></td>
      <td class="cell cell--occurrences"><span class="occ-value ${sevClass}">${e.occurrences}</span></td>
      <td class="cell"><span class="badge ${sevClass}">${severityLabel(e.occurrences)}</span></td>
      <td class="cell cell--date">${formatDate(e.lastSeen)}</td>
      <td class="cell">${runLinks || '<span class="no-runs">—</span>'}</td>
    </tr>`;
    })
    .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Flaky Test Dashboard</title>
  <style>
    :root {
      --bg-page: #F1EFE8; --bg-surface: #ffffff; --border: #D3D1C7;
      --text-primary: #2C2C2A; --text-muted: #888780; --text-faint: #B4B2A9;
      --focus: #378ADD;
      --critical-bg: #FCEBEB; --critical-text: #A32D2D;
      --high-bg: #FAEEDA;     --high-text: #854F0B;
      --medium-bg: #FAEEDA;   --medium-text: #BA7517;
      --low-bg: #F1EFE8;      --low-text: #5F5E5A;
      --project-bg: #E6F1FB;  --project-text: #185FA5;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-page: #1E1E1C; --bg-surface: #2A2A28; --border: #444441;
        --text-primary: #E8E6DF; --text-muted: #888780; --text-faint: #5F5E5A;
        --focus: #85B7EB;
        --critical-bg: #501313; --critical-text: #F09595;
        --high-bg: #412402;     --high-text: #FAC775;
        --medium-bg: #412402;   --medium-text: #FAC775;
        --low-bg: #2C2C2A;      --low-text: #B4B2A9;
        --project-bg: #042C53;  --project-text: #85B7EB;
      }
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-page); color: var(--text-primary); min-height: 100vh; padding: 32px 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 8px; }
    .header__title { font-size: 22px; font-weight: 500; }
    .header__subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { background: var(--bg-surface); border: 0.5px solid var(--border); border-radius: 12px; padding: 16px 20px; }
    .stat__value { font-size: 28px; font-weight: 500; line-height: 1; margin-bottom: 4px; }
    .stat__label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat__value--blue     { color: var(--focus); }
    .stat__value--default  { color: var(--text-primary); }
    .stat__value--critical { color: var(--critical-text); }
    .stat__value--high     { color: var(--high-text); }
    .filter-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .filter-bar input, .filter-bar select { padding: 8px 12px; border: 0.5px solid var(--border); border-radius: 8px; font-size: 13px; background: var(--bg-surface); color: var(--text-primary); outline: none; }
    .filter-bar input { flex: 1; min-width: 200px; }
    .filter-bar input:focus, .filter-bar select:focus { border-color: var(--focus); }
    .table-wrap { background: var(--bg-surface); border: 0.5px solid var(--border); border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: var(--bg-page); }
    th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 0.5px solid var(--border); white-space: nowrap; }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { color: var(--focus); }
    th.sortable .th-inner { display: inline-flex; align-items: center; gap: 5px; }
    th.sortable .sort-icon { display: inline-flex; flex-direction: column; gap: 1px; }
    th.sortable .sort-icon span { display: block; font-size: 8px; color: var(--text-faint); }
    th.sortable.sort-asc .asc-arrow, th.sortable.sort-desc .desc-arrow { color: var(--focus); }
    th.sortable.sort-asc, th.sortable.sort-desc { color: var(--focus); }
    .row:hover .cell { background: var(--bg-page); }
    .cell { padding: 12px 16px; border-bottom: 0.5px solid var(--border); }
    .cell--rank { color: var(--text-muted); font-size: 13px; width: 40px; }
    .cell--date { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
    .cell--occurrences { font-size: 18px; font-weight: 500; width: 120px; text-align: center; }
    .test-title { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
    .test-file { font-size: 12px; color: var(--text-muted); font-family: monospace; }
    .badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 4px; }
    .badge--project { background: var(--project-bg); color: var(--project-text); }
    .severity-critical { background: var(--critical-bg); color: var(--critical-text); }
    .severity-high     { background: var(--high-bg);     color: var(--high-text); }
    .severity-medium   { background: var(--medium-bg);   color: var(--medium-text); }
    .severity-low      { background: var(--low-bg);      color: var(--low-text); }
    .occ-value { background: transparent; padding: 0; }
    .run-link { color: var(--project-text); font-size: 12px; margin-right: 4px; }
    .run-link:hover { text-decoration: underline; }
    .no-runs { color: var(--text-faint); font-size: 12px; }
    .empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 14px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <h1 class="header__title">Flaky Test Dashboard</h1>
      <p class="header__subtitle">Last updated: ${updatedDate} UTC</p>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat__value stat__value--blue">${entries.length}</div><div class="stat__label">Flaky tests</div></div>
    <div class="stat"><div class="stat__value stat__value--default">${totalOccurrences}</div><div class="stat__label">Total occurrences</div></div>
    <div class="stat"><div class="stat__value stat__value--critical">${criticalCount}</div><div class="stat__label">Critical (10+)</div></div>
    <div class="stat"><div class="stat__value stat__value--high">${highCount}</div><div class="stat__label">High (5–9)</div></div>
  </div>
  <div class="filter-bar">
    <input type="text" id="search" placeholder="Search by test name or file…" oninput="filterTable()"/>
    <select id="sev-filter" onchange="filterTable()">
      <option value="">All severities</option>
      <option value="critical">Critical (10+)</option>
      <option value="high">High (5–9)</option>
      <option value="medium">Medium (2–4)</option>
      <option value="low">Low (1)</option>
    </select>
  </div>
  <div class="table-wrap">
    ${
        entries.length === 0
            ? `<div class="empty">No flaky tests recorded yet.</div>`
            : `<table>
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th class="sortable" data-col="1" onclick="sortTable(this)">
            <span class="th-inner">Test<span class="sort-icon"><span class="asc-arrow">▲</span><span class="desc-arrow">▼</span></span></span>
          </th>
          <th style="width:120px;">Project</th>
          <th class="sortable" data-col="3" onclick="sortTable(this)" style="width:120px;">
            <span class="th-inner">Occurrences<span class="sort-icon"><span class="asc-arrow">▲</span><span class="desc-arrow">▼</span></span></span>
          </th>
          <th style="width:100px;">Severity</th>
          <th class="sortable" data-col="5" onclick="sortTable(this)" style="width:160px;">
            <span class="th-inner">Last seen<span class="sort-icon"><span class="asc-arrow">▲</span><span class="desc-arrow">▼</span></span></span>
          </th>
          <th style="width:80px;">Runs</th>
        </tr>
      </thead>
      <tbody id="tbody">${rows}</tbody>
    </table>`
    }
  </div>
</div>
<script>
  function filterTable() {
    const q = document.getElementById('search').value.toLowerCase();
    const sev = document.getElementById('sev-filter').value;
    document.querySelectorAll('tr.row').forEach(function(r) {
      const matchQ = !q || r.dataset.title.includes(q) || r.dataset.file.includes(q);
      const matchS = !sev || r.dataset.sev === sev;
      r.style.display = matchQ && matchS ? '' : 'none';
    });
  }
  var sortState = { th: null, dir: 1 };
  function sortTable(th) {
    const col = parseInt(th.dataset.col, 10);
    const tbody = document.getElementById('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr.row'));
    if (sortState.th === th) { sortState.dir *= -1; }
    else { if (sortState.th) sortState.th.classList.remove('sort-asc','sort-desc'); sortState.th = th; sortState.dir = 1; }
    th.classList.toggle('sort-asc', sortState.dir === 1);
    th.classList.toggle('sort-desc', sortState.dir === -1);
    rows.sort(function(a, b) {
      if (col === 3) return sortState.dir * (parseInt(a.dataset.occurrences) - parseInt(b.dataset.occurrences));
      const av = col === 5 ? a.dataset.lastseen : (a.cells[col] ? a.cells[col].textContent.trim() : '');
      const bv = col === 5 ? b.dataset.lastseen : (b.cells[col] ? b.cells[col].textContent.trim() : '');
      return sortState.dir * av.localeCompare(bv);
    });
    rows.forEach(function(r) { tbody.appendChild(r); });
  }
</script>
</body>
</html>`;

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`[generate-dashboard] Dashboard written → ${outputPath}`);
