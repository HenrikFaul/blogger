import type { APIRoute } from "astro";
import { getCardPosts } from "../lib/content";
export const GET: APIRoute = async () => {
  const posts = await getCardPosts();
  return new Response(
    JSON.stringify(
      posts.map((p) => ({
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        url: `/posts/${p.slug}/`,
        tags: p.tags,
        body: (p.body || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/```[\s\S]*?```/g, " ")
          .slice(0, 25000),
      })),
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
};
