/** Shared by Astro's build configuration and the browser-safe site configuration. */
export function resolveSiteEnvironment(instance, env = {}) {
  const configured = String(env.PUBLIC_SITE_URL || instance.siteUrl || '').trim();
  const production = env.VERCEL_ENV === 'production' || env.REQUIRE_PRODUCTION_SITE === 'true';
  if (production && !configured) throw new Error('Production requires PUBLIC_SITE_URL or site.json.siteUrl.');
  const url = new URL(configured || 'http://localhost:4321');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('The site URL must be an http(s) origin without credentials, a path, query or fragment.');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local && url.protocol !== 'https:') throw new Error('A public site must use HTTPS.');
  if (['example.com', 'example.org', 'example.net'].includes(url.hostname)) throw new Error('Replace the example domain with the real site origin.');
  return { siteUrl: url.origin, noindex: !configured || local || env.VERCEL_ENV === 'preview', configured: !!configured };
}
