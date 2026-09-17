import type { APIRoute } from "astro";
import { siteConfig, siteEnvironment } from "../config/site.config";
export const GET: APIRoute = () =>
  new Response(
    siteEnvironment.noindex
      ? "User-agent: *\nDisallow: /\n"
      : `User-agent: *\nAllow: /\nDisallow: /creator/\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${siteConfig.siteUrl}/sitemap-index.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
