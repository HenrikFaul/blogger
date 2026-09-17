import { slugify } from "./safety";
export interface Publishable {
  status: string;
  publishedAt?: Date | string;
  slug?: string;
  pinned?: boolean;
}
export function isPublic(data: Publishable, now: Date = new Date()): boolean {
  const date = data.publishedAt ? new Date(data.publishedAt) : undefined;
  return (
    data.status === "published" &&
    !!date &&
    Number.isFinite(date.getTime()) &&
    date.getTime() <= now.getTime()
  );
}
export function getSlug(entry: {
  id: string;
  data: { slug?: string };
}): string {
  return entry.data.slug || entry.id.replace(/\.(md|mdx)$/, "");
}
export function readingMinutes(body = ""): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#*_`{}[\]]/g, " ");
  return Math.max(
    1,
    Math.ceil(plain.trim().split(/\s+/).filter(Boolean).length / 210),
  );
}
export const tagSlug = (tag: string) => slugify(tag);
export function validateReferences(
  posts: {
    id: string;
    data: {
      slug?: string;
      author: string;
      categories: string[];
      series?: string;
      relatedPosts: string[];
    };
  }[],
  authors: string[],
  categories: string[],
  series: string[],
): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const post of posts) {
    const slug = getSlug(post);
    if (slugs.has(slug)) errors.push(`Duplicate post slug: ${slug}`);
    slugs.add(slug);
    if (!authors.includes(post.data.author))
      errors.push(`${post.id}: unknown author ${post.data.author}`);
    for (const cat of post.data.categories)
      if (!categories.includes(cat))
        errors.push(`${post.id}: unknown category ${cat}`);
    if (post.data.series && !series.includes(post.data.series))
      errors.push(`${post.id}: unknown series ${post.data.series}`);
  }
  for (const post of posts)
    for (const related of post.data.relatedPosts)
      if (!slugs.has(related))
        errors.push(`${post.id}: unknown related post ${related}`);
  return errors;
}
