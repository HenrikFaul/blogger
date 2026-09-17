import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import instance from './src/config/site.json' with { type: 'json' };
import { resolveSiteEnvironment } from './src/config/site-runtime.mjs';
// Vercel injects these variables. Local .env support uses Node's built-in parser.
try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const environment = resolveSiteEnvironment(instance, process.env);
export default defineConfig({
  site: environment.siteUrl,
  output: 'static',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()], define: { 'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV || '') } },
  integrations: [react(), mdx(), sitemap({filter: page => !/\/(creator|admin|404)(\/|$)/.test(new URL(page).pathname)})],
  markdown: { shikiConfig: { theme: 'github-light' } },
});
