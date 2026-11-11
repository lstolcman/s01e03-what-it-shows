import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-static';
import { fileURLToPath } from 'node:url';

// mdsvex reads the layout at build time, so give it a real path on disk.
// It is computed from this file, so the project builds from any folder.
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      layout: {
        runbook
      }
    })
  ],
  kit: {
    adapter: adapter({ strict: false }),
    prerender: { entries: ['*'], crawl: true }
  }
};

export default config;
