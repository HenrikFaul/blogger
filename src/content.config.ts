import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  postSchema,
  pageSchema,
  projectSchema,
  authorSchema,
  categorySchema,
  seriesSchema,
} from "./lib/content-schemas";
export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
    schema: postSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
    schema: pageSchema,
  }),
  projects: defineCollection({
    loader: glob({
      pattern: "**/[^_]*.{md,mdx}",
      base: "./src/content/projects",
    }),
    schema: projectSchema,
  }),
  authors: defineCollection({
    loader: glob({ pattern: "**/[^_]*.json", base: "./src/content/authors" }),
    schema: authorSchema,
  }),
  categories: defineCollection({
    loader: glob({
      pattern: "**/[^_]*.json",
      base: "./src/content/categories",
    }),
    schema: categorySchema,
  }),
  series: defineCollection({
    loader: glob({ pattern: "**/[^_]*.json", base: "./src/content/series" }),
    schema: seriesSchema,
  }),
};
