import { z } from "astro/zod";
import { safeImageUrl } from "./safety";
import { themeRegistry } from "../themes/registry";
export const seoSchema = z
  .object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    canonicalUrl: z
      .url()
      .refine((v) => /^https:\/\//.test(v))
      .optional(),
    ogImage: z
      .string()
      .refine((v) => !!safeImageUrl(v))
      .optional(),
    noindex: z.boolean().default(false),
  })
  .optional();
export const imageSchema = z
  .object({
    src: z
      .string()
      .refine(
        (v) => !!safeImageUrl(v),
        "A valid local or HTTP(S) image URL is required.",
      ),
    alt: z.string().default(""),
    decorative: z.boolean().default(false),
    caption: z.string().optional(),
    credit: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    focalPoint: z
      .object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) })
      .optional(),
  })
  .refine((v) => v.decorative || v.alt.trim().length > 0, {
    message: "Add alternative text or explicitly mark the image as decorative.",
    path: ["alt"],
  });
const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(100);
export const postSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    slug: slugSchema.optional(),
    excerpt: z.string().trim().min(10).max(300),
    author: slugSchema,
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    status: z
      .enum(["draft", "review", "published", "archived"])
      .default("draft"),
    categories: z.array(slugSchema).min(1),
    tags: z.array(z.string().trim().min(1).max(40)).default([]),
    heroImage: imageSchema.optional(),
    heroTreatment: z
      .enum(["standard", "full-bleed", "split", "hidden"])
      .default("standard"),
    themeOverride: z
      .string()
      .refine(
        (key) => themeRegistry.some((t) => t.key === key),
        "Unknown theme",
      )
      .optional(),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    series: slugSchema.optional(),
    seriesOrder: z.number().int().positive().optional(),
    gallery: z.array(imageSchema).max(50).optional(),
    relatedPosts: z.array(slugSchema).default([]),
    seo: seoSchema,
  })
  .refine((v) => v.status !== "published" || !!v.publishedAt, {
    message: "Published content needs a publication date.",
    path: ["publishedAt"],
  });
export const pageSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  heroImage: imageSchema.optional(),
  seo: seoSchema,
});
export const authorSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  avatar: z
    .string()
    .refine((v) => !!safeImageUrl(v))
    .optional(),
  social: z.record(z.string(), z.url()).optional(),
});
export const categorySchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[a-f\d]{6}$/i)
    .optional(),
  image: z
    .string()
    .refine((v) => !!safeImageUrl(v))
    .optional(),
});
export const seriesSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(300),
  image: imageSchema.optional(),
});
export const projectSchema = postSchema.safeExtend({
  client: z.string().optional(),
  year: z.number().int().optional(),
  role: z.string().optional(),
  link: z.url().optional(),
});
