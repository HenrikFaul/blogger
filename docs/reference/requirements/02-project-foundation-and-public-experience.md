# Prompt 02 — Project Foundation and Public Experience

## Copy-ready prompt

You are a senior Astro, TypeScript, accessibility, and performance engineer. Implement the foundational codebase for **ForgeBlog**, a static-first, white-label personal blog engine. This task covers public-site architecture, content loading, design tokens, shared components, routing, static generation, quality checks, and Vercel deployment. It does not implement a conventional backend or database.

The deployment constraint is strict:

- Code and content live in GitHub.
- The site builds and deploys through Vercel.
- Public pages are statically generated.
- Content is Markdown/MDX and typed frontmatter.
- Use browser-only state only for noncanonical interface preferences.
- Do not add a database, a hosted CMS, user accounts for public visitors, or server-dependent content delivery.

Create a production-ready implementation, with clean separation between reusable engine code and instance-specific branding/content.

---

# Technology baseline

Use a stable version of each package at implementation time. Do not invent version numbers. Generate the lockfile and include the exact package versions chosen.

Preferred stack:

- Astro, TypeScript strict mode.
- Astro Content Collections with Zod validation.
- MDX for rich, component-capable posts.
- Tailwind CSS for utility styling, but keep semantic component classes and CSS variables as the long-term interface.
- Astro image support / assets pipeline for local image optimization.
- Small React islands only when a component genuinely needs client interactivity.
- Accessible primitive libraries only where they materially reduce risk; avoid a large component library that forces client JavaScript onto the public site.
- Icon library with tree-shakeable SVG icons, or inline local SVG assets.
- `@astrojs/sitemap` and RSS generation.
- Syntax highlighting with a build-time approach where possible.
- Playwright for end-to-end visual / accessibility smoke tests if practical.
- Vitest for deterministic utility and schema tests.

Do not use a client-side SPA router. Do not hydrate the entire page. Avoid scroll libraries, animation frameworks, or canvas libraries in the foundation unless loaded only in a specific theme/island.

---

# Deliverable scope

Build the following:

1. Repository scaffold.
2. Strict content schemas.
3. Public routes and layouts.
4. Shared semantic components.
5. Token-based theming foundation.
6. Responsive typography and editorial layout.
7. Content indexes, article pages, taxonomy pages, series pages, author pages, search fallback strategy.
8. SEO, RSS, sitemap, robots, structured data.
9. Static image utilities and responsive figure system.
10. Vercel and GitHub workflow configuration.
11. Tests, linting, formatting, and documentation.

The coding result must compile with `npm run build` and be deployment-ready on Vercel without manual code edits.

---

# Required repository layout

Create this repository structure or an equivalent structure that preserves the same separation of concerns:

```text
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── content-validation.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── creator/                 # Reserved static entry only; implementation comes later
│   └── social/
├── src/
│   ├── assets/
│   │   ├── brand/
│   │   ├── images/
│   │   └── fonts/
│   ├── components/
│   │   ├── chrome/
│   │   ├── content/
│   │   ├── media/
│   │   ├── seo/
│   │   ├── ui/
│   │   └── islands/
│   ├── config/
│   │   ├── site.config.ts
│   │   ├── navigation.config.ts
│   │   └── feature-flags.ts
│   ├── content/
│   │   ├── authors/
│   │   ├── categories/
│   │   ├── pages/
│   │   ├── posts/
│   │   ├── projects/
│   │   ├── series/
│   │   ├── site/
│   │   └── config.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   ├── ListingLayout.astro
│   │   ├── ProjectLayout.astro
│   │   └── PageLayout.astro
│   ├── lib/
│   │   ├── content/
│   │   ├── dates/
│   │   ├── images/
│   │   ├── seo/
│   │   ├── strings/
│   │   └── theme/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── archive.astro
│   │   ├── rss.xml.ts
│   │   ├── 404.astro
│   │   ├── posts/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── category/
│   │   │   └── [slug].astro
│   │   ├── tag/
│   │   │   └── [slug].astro
│   │   ├── series/
│   │   │   └── [slug].astro
│   │   ├── author/
│   │   │   └── [slug].astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── styles/
│   │   ├── global.css
│   │   ├── reset.css
│   │   ├── prose.css
│   │   ├── utilities.css
│   │   └── themes/
│   ├── types/
│   └── env.d.ts
├── docs/
│   ├── setup.md
│   ├── content-authoring.md
│   ├── deployment.md
│   ├── theme-customization.md
│   └── operations.md
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json
├── eslint.config.js
├── prettier.config.cjs
├── README.md
└── .env.example
```

Explain in the README which paths may safely be customized per instance and which represent engine code that should be updated through release upgrades.

---

# Content schema implementation

Implement `src/content/config.ts` with strict Zod schemas. Use `defineCollection` and clear reusable schema fragments.

Requirements:

- Slugs must be normalized and collision-safe.
- Dates must parse as dates but serialize safely for JSON-LD and UI.
- A post cannot be marked published without a valid publication date, title, excerpt, author, and hero media alt text if hero media exists.
- Every image object must require either meaningful `alt` text or `decorative: true`.
- Do not permit a decorative hero image when the hero is the principal content image.
- Category and author references must validate at build time.
- `draft`, `review`, and `archived` content must never appear in production listing routes.
- Scheduled content is metadata only for the static build. Define behavior precisely: either build excludes a future `publishedAt` post or it is included only when a rebuild occurs after that date. Explain that pure static hosting cannot automatically publish at an arbitrary time without a trigger.
- All optional per-vertical metadata must be type-safe and isolated: recipe, trip, project, technical article.

Use sample content files in the repository so the codebase renders convincingly out of the box. Include at least:

- Three general posts.
- One technical post with code samples.
- One travel story.
- One recipe.
- One work/case-study project.
- Two authors.
- Three categories.
- One series.

Use fictional or generic sample data; do not copy copyrighted source material.

---

# Site configuration

Implement a typed `site.config.ts` that is the primary instance configuration boundary. It must include:

- Site name and legal name.
- Base site URL with environment-aware fallback.
- Description.
- Default language and supported languages.
- Time zone.
- Brand assets.
- Default theme key.
- Accent overrides permitted by theme.
- Contact and social links.
- Footer text.
- Default SEO configuration.
- Analytics placeholder disabled by default.
- Feature flags.
- Content display defaults.
- Copyright year handling.
- Repository URL and creator workspace URL.

Never hardcode an example production domain into canonical URLs. Use a single site URL resolver and document environment variable precedence.

---

# Public component inventory

Implement semantic, reusable components. Each component must use slots / props responsibly, expose variants through a narrow API, and maintain accessibility.

## Chrome

- `SiteHeader`: logo, primary navigation, optional utility navigation, mobile menu that works with keyboard and escape key.
- `SiteFooter`: navigation groups, social links, legal copy, RSS link.
- `SkipLink`.
- `ThemeModeToggle`: only for themes supporting user-chosen light/dark preference; store preference locally and avoid flash of incorrect theme.
- `ReadingProgress`: optional, progressively enhanced, disabled for reduced motion.

## Content

- `ArticleHeader`.
- `ArticleMeta`.
- `ArticleBody` / prose wrapper.
- `TableOfContents`: generated from headings; collapsible only with small client enhancement if required.
- `PostCard` with compact, standard, featured, horizontal, and visual variants.
- `PostGrid`.
- `FeaturedPost`.
- `TagList`.
- `CategoryBadge`.
- `AuthorByline`.
- `AuthorCard`.
- `SeriesNavigator`.
- `RelatedPosts`.
- `NewsletterPlaceholder`: static opt-in placeholder only, no fake submission backend.
- `Pagination`.
- `EmptyState`.
- `Callout` for MDX.
- `CodeBlock` with accessible copy action as a tiny client island.

## Media

- `ResponsiveImage`.
- `Figure` with caption, credit, aspect ratio, and optional full-bleed treatment.
- `HeroMedia`.
- `Gallery` interface placeholder; full implementation happens in a later prompt.
- `VideoEmbed`: allow-list only, lazy load with consent-friendly click-to-load behavior.

## SEO

- `SEOHead`.
- `JsonLd`.
- `SocialMeta`.
- `CanonicalLink`.

## UI

- `Button`.
- `IconButton`.
- `Badge`.
- `Disclosure`.
- `Dialog` only if needed and fully accessible.
- `VisuallyHidden`.

Use semantic HTML first. Do not create div-heavy fake controls.

---

# Layout and route specification

Implement these public routes:

- `/`: an adaptable homepage driven by a page-composition configuration. Include hero, latest articles, featured article, selected categories, project showcase, author statement, and optional visual feature section. Individual themes may arrange these differently.
- `/posts/`: paginated or progressively loadable listing that still works without JavaScript. Implement static pagination routes if content volume requires it.
- `/posts/[slug]/`: article route.
- `/projects/` and `/projects/[slug]/`.
- `/category/[slug]/`.
- `/tag/[slug]/`.
- `/series/[slug]/`.
- `/author/[slug]/`.
- `/archive/`: chronological index.
- static pages from the `pages` collection, avoiding collision with reserved paths.
- `/rss.xml`.
- `/sitemap-index.xml` or normal sitemap as appropriate.
- `/404`.

For listing and detail pages define empty states, pagination behavior, canonical behavior, draft filtering, and title formats.

---

# Editorial typography system

Build a resilient, premium reading system.

Requirements:

- Use semantic CSS variables for font families, font sizes, lines, measures, and spacing.
- Default reading width around 65–75 characters, configurable by theme.
- Strong hierarchy across display heading, H1, H2, H3, body, lead paragraph, quote, caption, code, lists, table cells, label, and metadata.
- Handle long unbroken URLs, code, Hungarian accents, wide tables, and CJK-safe fallbacks where practical.
- Use `font-display` behavior that avoids invisible text.
- Prevent layout shift from late font load as much as reasonably possible.
- Ensure prose styles are not globally destructive to components embedded in MDX.
- Include print styles for article pages.

Implement at least one premium serif editorial mode and one modern sans/mono technology mode through theme tokens. Do not force every theme to load every font.

---

# Design-token foundation

Build the base token architecture independent of the later large theme catalogue.

Create:

- Core neutral and semantic tokens.
- Typography tokens.
- Spacing scale.
- Border, radius, elevation, and motion tokens.
- Breakpoint and container conventions.
- Theme token contract documentation.

Do not use hardcoded hex colors in component styles except inside a theme token definition. Components must use semantic variables such as `--color-surface`, `--color-text`, `--color-primary`, and `--focus-ring`.

Create at least three functioning initial themes:

1. `minimal-editorial`.
2. `developer-console`.
3. `travel-atlas`.

Each must be visually distinct yet satisfy accessibility requirements. Add a theme selector abstraction so later themes plug in without changing page routes or component APIs.

---

# SEO and structured data

Implement a single metadata builder that resolves fields in this order:

1. Page/post explicit override.
2. Content collection data.
3. Site-level defaults.

Generate:

- Unique title and description.
- Canonical URL based on the resolved current site URL.
- Open Graph metadata.
- X/Twitter card metadata.
- Article publish/modified times where applicable.
- RSS endpoint.
- Sitemap.
- JSON-LD for WebSite, Person or Organization, Blog, BlogPosting, BreadcrumbList, Recipe if recipe fields exist, and CreativeWork/Project for projects.

Avoid duplicate or contradictory metadata. Add tests for URL generation and metadata fallbacks.

---

# Search strategy without backend

Do not implement Algolia, a server search index, or a remote database in this foundation.

Implement a pragmatic static search strategy:

- Generate a compact static JSON index at build time containing only public searchable fields: title, slug, excerpt, date, tags, categories, and optionally plaintext excerpt.
- Create a lazy-loaded client-side search island that downloads only after the user opens search.
- Include keyboard support, focus trapping for dialog search if a dialog is used, result announcements, no-results state, and escape behavior.
- For sites with very large content libraries, document the index-size tradeoff and a future pluggable external-search adapter, but do not add it now.

---

# Image implementation

Use local Git-managed assets as baseline.

Requirements:

- Image paths from frontmatter must be validated and optimized through the appropriate Astro asset mechanism.
- Always output explicit width and height or CSS aspect ratio reservation to control CLS.
- Generate responsive variants.
- Use lazy loading below the fold and prioritize an LCP hero only if it is actually above the fold.
- Require alt text / decorative designation.
- Include caption and credit support.
- Do not use CSS background images for content images where semantics matter.

Document recommended asset size limits and a pre-commit / CI check approach for oversized image files.

---

# Vercel configuration

Provide `vercel.json` only where needed. Keep it minimal.

Document:

- Importing the repository into Vercel.
- Framework detection / build command.
- Environment variables such as `PUBLIC_SITE_URL` and `PUBLIC_SITE_INSTANCE`.
- Attaching a custom domain.
- Production branch behavior.
- Preview deployments from pull requests.
- Rollback through Vercel deployment history and Git revert.
- No reliance on Vercel serverless functions for public content rendering.

Also provide a GitHub Actions CI workflow that runs install, typecheck, lint, test, build, and optionally a lightweight static accessibility check. It must not require secrets to pass on a fork.

---

# Quality and acceptance tests

Implement and document objective acceptance checks:

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- Production build excludes drafts/review content from public pages and sitemap/RSS.
- Every published sample post produces title, description, canonical, Open Graph fields, and BlogPosting JSON-LD.
- Keyboard users can skip navigation, operate mobile navigation, open/close search, and copy code blocks.
- No invalid image without alt/decorative intent passes schema validation.
- Public article pages do not need a hydrated app shell.
- No hidden dependency on a database, API key, or local machine path exists.

Write a `README.md` that supports a nonexpert owner, including the commands to run locally, create a post, change theme, deploy to Vercel, attach a domain, and recover from a bad publish.

---

# Output instructions

Return:

1. The complete file tree.
2. All key source/configuration files in full.
3. Representative sample content.
4. Commands for setup and validation.
5. Documentation files in full or sufficiently complete form.
6. A short implementation note listing deliberate exclusions left for later prompts: Creator Workspace, advanced galleries, Git commit UI, visual theme explorer, and white-label updater.

Do not skip code by writing “implement similarly.” Use cohesive, production-quality code. If an external package introduces uncertainty, favor a smaller custom implementation with clearly tested behavior.
