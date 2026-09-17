import type { APIRoute } from "astro";
import { getCardPosts } from "../lib/content";
import { siteConfig } from "../config/site.config";
import { escapeXml } from "../lib/safety";
export const GET: APIRoute = async () => {
  const posts = await getCardPosts();
  const x = escapeXml;
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${x(siteConfig.name)}</title><link>${x(siteConfig.siteUrl)}</link><description>${x(siteConfig.description)}</description><language>${x(siteConfig.language)}</language><atom:link href="${x(siteConfig.siteUrl)}/rss.xml" rel="self" type="application/rss+xml"/>${posts.map((p) => `<item><title>${x(p.title)}</title><link>${x(siteConfig.siteUrl)}/posts/${x(p.slug)}/</link><guid isPermaLink="true">${x(siteConfig.siteUrl)}/posts/${x(p.slug)}/</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${x(p.excerpt)}</description><category>${x(p.category)}</category></item>`).join("")}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
