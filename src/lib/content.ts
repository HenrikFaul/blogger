import { getCollection, type CollectionEntry } from "astro:content";
import {
  getSlug,
  isPublic,
  readingMinutes,
  validateReferences,
} from "./public-content";
export { getSlug, readingMinutes, isPublic } from "./public-content";
export async function getPublishedPosts(): Promise<CollectionEntry<"posts">[]> {
  const [posts, authors, categories, series] = await Promise.all([
    getCollection("posts"),
    getCollection("authors"),
    getCollection("categories"),
    getCollection("series"),
  ]);
  const publicPosts = posts.filter((p) => isPublic(p.data));
  const errors = validateReferences(
    publicPosts,
    authors.map((a) => a.id),
    categories.map((c) => c.id),
    series.map((s) => s.id),
  );
  if (errors.length)
    throw new Error(`Content integrity errors:\n${errors.join("\n")}`);
  return publicPosts.sort(
    (a, b) =>
      Number(b.data.pinned) - Number(a.data.pinned) ||
      b.data.publishedAt!.getTime() - a.data.publishedAt!.getTime(),
  );
}
export function formatDate(
  date: Date | string,
  style: "short" | "long" = "short",
): string {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "Europe/Budapest",
  }).format(new Date(date));
}
export type CardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image?: { src: string; alt: string; width?: number; height?: number };
  author: string;
  authorId: string;
  authorAvatar?: string;
  category: string;
  categoryId: string;
  categoryIds: string[];
  categoryNames: string[];
  date: string;
  readingTime: number;
  tags: string[];
  body?: string;
};
export async function getCardPosts(): Promise<CardPost[]> {
  const [posts, authors, categories] = await Promise.all([
    getPublishedPosts(),
    getCollection("authors"),
    getCollection("categories"),
  ]);
  return posts.map((post) => ({
    id: post.id,
    slug: getSlug(post),
    title: post.data.title,
    excerpt: post.data.excerpt,
    image: post.data.heroImage
      ? {
          ...post.data.heroImage,
          alt: post.data.heroImage.decorative ? "" : post.data.heroImage.alt,
        }
      : undefined,
    author:
      authors.find((a) => a.id === post.data.author)?.data.name ||
      post.data.author,
    authorId: post.data.author,
    authorAvatar: authors.find((a) => a.id === post.data.author)?.data.avatar,
    category:
      categories.find((c) => c.id === post.data.categories[0])?.data.title ||
      post.data.categories[0],
    categoryId: post.data.categories[0],
    categoryIds: post.data.categories,
    categoryNames: post.data.categories.map(
      (id) => categories.find((c) => c.id === id)?.data.title || id,
    ),
    date: post.data.publishedAt!.toISOString(),
    readingTime: readingMinutes(post.body),
    tags: post.data.tags,
    body: post.body,
  }));
}
