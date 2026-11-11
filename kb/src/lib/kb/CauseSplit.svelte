<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // The split of one ticket into the causes its reports really belong to.
  // Counts come from the export and causes.ts at render time; nothing here is typed in.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const share = (n: number) => `${Math.round((n / merged.length) * 100)}%`;
  const channels = (rs: Report[]) => {
    const n = rs.reduce<Record<string, number>>((all, r) => ({ ...all, [r.channel]: (all[r.channel] ?? 0) + 1 }), {});
    return Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([channel, count]) => `${channel} ${count}`)
      .join(', ');
  };
  const issueNo = (url: string) => `#${url.split('/').pop()}`;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket}, in
  <strong>{groups.length}</strong> {groups.length === 1 ? 'cause' : 'causes'}.
</p>

<table>
  <thead>
    <tr><th>cause</th><th>reports</th><th>share</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      <tr>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{share(g.reports.length)}</td>
        <td>{g.tenants}</td>
        <td>{channels(g.reports)}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.cause]}
            <a href={tickets[g.cause]}>{issueNo(tickets[g.cause])}</a>
          {:else}
            none
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.cause)}
  {@const moved = readAs(g, notes.oneDayMove)}
  {#if moved}
    <p class="note">
      {moved} of these {g.reports.length} read as a one-day move. They stay counted under
      <code>{g.cause}</code>, filed by tenant, as the desk does.
    </p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.05rem; }
  .note { color: var(--muted); font-size: 0.85rem; }
</style>
