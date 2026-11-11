// Turns the built kb page into one HTML file with its styles inside, so the desk can open it
// without a server. Run `npm run build` in kb/ first, then: node tools/render-page.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const page = path.join(root, 'kb', 'build', 'kb', 'incidents', '4471-causes', 'index.html');
const outDir = path.join(root, 'rendered');
const out = path.join(outDir, '4471-causes.html');

let html = fs.readFileSync(page, 'utf8');

// Inline every stylesheet the page links to. The page has no server, so the styles travel with it.
html = html.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, (tag) => {
  const href = /href="([^"]+)"/.exec(tag)?.[1];
  if (!href) return '';
  const file = path.resolve(path.dirname(page), decodeURIComponent(href));
  if (!fs.existsSync(file)) {
    console.warn(`missing stylesheet, dropped: ${href}`);
    return '';
  }
  return `<style>\n${fs.readFileSync(file, 'utf8')}\n</style>`;
});

// Drop hydration: this file is a copy of the page, not an app.
html = html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '')
  .replace(/<link[^>]+rel="preload"[^>]*>/g, '');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(root, out)} (${html.length} bytes)`);
