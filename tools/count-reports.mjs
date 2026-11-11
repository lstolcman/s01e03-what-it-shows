// Counts what ticket #4471 really holds, with the desk's own grouping.
// Mirrors causeOf()/groupByCause() from kb/src/lib/kb/causes.ts and runs it over the export.
// Usage: node tools/count-reports.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const kb = path.join(root, 'kb');
const TICKET = 4471;

const reports = JSON.parse(fs.readFileSync(path.join(kb, 'src/lib/data/reports-4471.json'), 'utf8'));
const notes = JSON.parse(fs.readFileSync(path.join(kb, 'src/lib/data/desk-notes.json'), 'utf8'));
const tenantDir = path.join(kb, 'src/lib/data/tenants');
const tenants = new Map(
  fs.readdirSync(tenantDir).map((f) => {
    const t = JSON.parse(fs.readFileSync(path.join(tenantDir, f), 'utf8'));
    return [t.handle, t];
  })
);

// What each booking form prints under its date field.
const DATE_HINT = { 'booking-v2': 'DD/MM/YYYY', 'booking-v3': 'MM/DD/YYYY' };

// Asked of the platform, never typed in a list.
function dayFirst(locale) {
  const order = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(Date.UTC(2026, 0, 2, 12)))
    .map((p) => p.type);
  return order.indexOf('day') < order.indexOf('month');
}

function causeOf(r, t) {
  if (!t || !dayFirst(t.locale)) return null;
  return r.channel === 'form' && DATE_HINT[t.form].startsWith('MM') ? 'hint' : 'parser';
}

// The export pages overlap: one id, one report.
const uniqueById = (rs) => [...new Map(rs.map((r) => [r.id, r])).values()];

const merged = uniqueById(reports).filter((r) => r.mergedInto === TICKET);
const byCause = new Map();
for (const r of merged) {
  const cause = causeOf(r, tenants.get(r.tenant)) ?? 'unplaced';
  byCause.set(cause, [...(byCause.get(cause) ?? []), r]);
}

const rows = [...byCause.entries()]
  .map(([cause, rs]) => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    const channels = rs.reduce((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {});
    return {
      cause,
      reports: rs.length,
      share: `${Math.round((rs.length / merged.length) * 100)}%`,
      tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
      channels,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      oneDayMove: notes.oneDayMove.filter((id) => rs.some((r) => r.id === id))
    };
  })
  .sort((a, b) => b.reports - a.reports);

console.log(`rows in export: ${reports.length}, unique ids: ${uniqueById(reports).length}`);
console.log(`merged into #${TICKET}: ${merged.length}, causes: ${rows.length}\n`);
for (const r of rows) {
  console.log(`${r.cause}: ${r.reports} reports (${r.share})`);
  console.log(`  tenants (${r.tenants.length}): ${r.tenants.join(', ')}`);
  console.log(`  channels: ${Object.entries(r.channels).map(([c, n]) => `${c} ${n}`).join(', ')}`);
  console.log(`  seen: ${r.firstSeen} -> ${r.lastSeen}`);
  if (r.oneDayMove.length) console.log(`  one-day move, still counted here: ${r.oneDayMove.join(', ')}`);
  console.log();
}
