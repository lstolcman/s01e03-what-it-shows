# S01E03 — what it shows

The support desk merged 412 reports about dates into one ticket, #4471, and marked it known.
This repo is that ticket split into the problems it really holds, with a count per problem, and
a signed page for the desk's knowledge base.

## What is here

| path | what it is |
| --- | --- |
| `kb/` | the desk's kb export, unchanged, plus two files I added (below) |
| `kb/src/routes/kb/incidents/4471-causes/+page.svx` | the page I add to the kb |
| `kb/src/lib/kb/CauseSplit.svelte` | the component that computes the split at render time |
| `rendered/4471-causes.html` | the page as the desk will see it, styles inside, open with a browser |
| `tools/count-reports.mjs` | the same count from the terminal |
| `tools/render-page.mjs` | rebuilds `rendered/4471-causes.html` from the built page |

## The two problems

| cause | reports | tenants | channels | first → last |
| --- | --- | --- | --- | --- |
| `parser` | 379 | 11 (all on file) | app 204, email 150, form 25 | 2026-04-01 → 2026-10-04 |
| `hint` | 33 | 3 (alder.physio, copper.studio, pale.harbour) | form 33 | 2026-04-17 → 2026-09-22 |

379 + 33 = 412, the number the incident page states. The desk's tickets are the issues in this
repo: #1 `parser`, #2 `hint`.

The count follows the desk's own rule, `causeOf()` in `kb/src/lib/kb/causes.ts`: a report from a
day-first tenant gets `parser`, unless it came through booking-v3's form, whose `MM/DD/YYYY` hint
makes it `hint`. The export has 427 rows but 412 unique ids; `uniqueById()` drops the overlap.

Five reports (R-41202, R-41209, R-41236, R-41344, R-41620) are listed in `desk-notes.json` as a
one-day move. They stay counted under `parser`, as the desk files them, and the page footnotes
them. They are not a third problem.

## Run it

    node tools/count-reports.mjs

prints the groups above from `kb/src/lib/data/reports-4471.json`.

To build the page yourself (SvelteKit + mdsvex, the desk's own stack):

    cd kb
    npm install
    npm run build
    cd ..
    node tools/render-page.mjs

That writes `rendered/4471-causes.html`.

## The page's signature

The page carries a `signature` in its frontmatter and ends with `<RenderStamp {signature} />`,
so the desk can see who wrote it. The stamp is derived from the signature at render time
(`DR-MMCS-8GHP` for this page).
