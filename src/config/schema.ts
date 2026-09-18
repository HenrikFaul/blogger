import { z } from "astro/zod";
export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z
    .string()
    .refine(
      (v) => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v),
      "Use a root-relative or HTTPS URL.",
    ),
  isExternal: z.boolean().optional(),
});
export const InstanceConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(60),
  siteUrl: z.string(),
  description: z.string().min(10).max(500),
  language: z.literal("hu"),
  timeZone: z.string(),
  theme: z.string(),
  defaultMode: z.enum(["light", "dark"]).default("light"),
  demoContent: z.boolean().default(false),
  logo: z.object({ src: z.string(), alt: z.string() }),
  favicon: z.string(),
  social: z.record(z.string(), z.url()).default({}),
  contact: z
    .object({
      email: z.email().optional(),
      imprintUrl: z.string().optional(),
      privacyUrl: z.string().optional(),
      termsUrl: z.string().optional(),
    })
    .default({}),
  seo: z.object({
    defaultTitleTemplate: z.string(),
    defaultDescription: z.string().optional(),
    defaultOgImage: z.string().optional(),
    noindexDrafts: z.boolean().default(true),
  }),
  content: z.object({
    postsPerPage: z.number().int().min(1).max(50),
    showReadingTime: z.boolean(),
    showLastUpdated: z.boolean(),
    defaultAuthor: z.string(),
  }),
  features: z.object({
    searchEnabled: z.boolean(),
    newsletterEnabled: z.literal(false),
    commentsEnabled: z.literal(false),
    analyticsEnabled: z.literal(false),
  }),
  /* Optional top strip. Off by default so a plain magazine instance stays clean. */
  announcement: z
    .object({
      enabled: z.boolean().default(false),
      text: z.string().max(160),
      linkLabel: z.string().max(40).optional(),
      href: z
        .string()
        .refine((v) => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), "Use a root-relative or HTTPS URL.")
        .optional(),
    })
    .default({ enabled: false, text: "" }),
  /* Landing-page copy. Kept in config so a white-label instance retargets the home
     page without editing Astro components. */
  home: z
    .object({
      eyebrow: z.string().default(""),
      headline: z.string().default(""),
      headlineAccent: z.string().default(""),
      lede: z.string().default(""),
      primaryCtaLabel: z.string().default(""),
      primaryCtaHref: z.string().default("/posts/"),
      secondaryCtaLabel: z.string().default(""),
      secondaryCtaHref: z.string().default("/about/"),
      assurances: z.array(z.string()).default([]),
      quote: z.string().default(""),
      quoteAttribution: z.string().default(""),
      stats: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .default([]),
      bentoBoxes: z
        .array(z.object({
          title: z.string(),
          description: z.string(),
          features: z.array(z.string()).optional(),
          ctaLabel: z.string().optional(),
          ctaHref: z.string().optional()
        }))
        .default([]),
    })
    .default({
      eyebrow: "",
      headline: "",
      headlineAccent: "",
      lede: "",
      primaryCtaLabel: "",
      primaryCtaHref: "/posts/",
      secondaryCtaLabel: "",
      secondaryCtaHref: "/about/",
      assurances: [],
      quote: "",
      quoteAttribution: "",
      stats: [],
      bentoBoxes: [],
    }),
  navigation: z.object({
    header: z.array(NavItemSchema),
    footer: z.array(NavItemSchema),
  }),
  legal: z.object({
    copyrightHolder: z.string(),
    copyrightYearStart: z.number().int(),
  }),
});
export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
