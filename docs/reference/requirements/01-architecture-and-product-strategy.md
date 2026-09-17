# Prompt 01 — Architecture and Product Strategy

## Copy-ready prompt

You are the principal product architect, staff frontend engineer, interaction designer, static-site platform engineer, and technical writer for a premium white-label personal blog engine.

Design the architecture and execution plan for a visually exceptional, highly configurable, static-first personal publishing platform called **ForgeBlog**. It must be deployable as independent branded blog sites on real custom domains such as `faulhenrik.hu`, `itadminblog.com`, `mytraveljournal.com`, or `chefanna.hu`. It must never require a conventional backend, database, hosted CMS, or permanent application server.

The allowed operational foundation is:

- GitHub repositories for source control, immutable content history, configuration, and editorial commits.
- Vercel for static deployment, CDN delivery, preview deployments, environment variables, automatic HTTPS, custom-domain attachment, and optional build-time or deployment-time platform capabilities.
- Browser-local state only for editor convenience features such as unsaved drafts, undo/redo, UI preferences, and temporary previews.
- Static files, Markdown/MDX, JSON, YAML, and Git history as the canonical content and configuration storage.

Do not propose Supabase, Firebase, PostgreSQL, MongoDB, WordPress, Contentful, Sanity, Strapi, a proprietary hosted CMS, or any persistent custom API/database. If a capability cannot be achieved reliably within a GitHub + Vercel-only constraint, explicitly label it as a later optional extension rather than pretending it exists.

Your output must be an implementation-grade master blueprint, not a generic overview. It will be given to a coding agent afterwards.

---

# Product vision

ForgeBlog is not a generic blog theme. It is a reusable, premium publishing engine and design system for creators. Every deployed instance has its own identity, custom domain, visual theme, content, navigation, policies, branding, social profiles, and deployment project. A site must feel handcrafted even when it is assembled from the same engine.

The product must support these creator personas and presentation modes:

1. Minimal personal writer: calm typography, essays, notes, reading-first layout.
2. Futurist / technology writer: dark immersive UI, terminal or glass design language, code-first content, interactive visual accents.
3. Travel author: immersive photography, map-friendly places, trip journals, timeline narratives, packing and route information.
4. Cooking creator: recipe cards, ingredient scaling interface that works locally in the browser, cooking timelines, nutrition disclaimer fields, photo sequences.
5. Experience / diary creator: emotional long-form stories, mood metadata, visual journals, chronological collections.
6. Professional office worker: authority-building articles, case studies, career content, practical templates and resources.
7. Tradesperson / industrial professional: job stories, before/after galleries, technical details, safety notices, equipment metadata.
8. Artist / photographer / designer: visual projects, portfolios, full-screen galleries, process articles, project metadata.
9. Developer / IT administrator: code snippets, copy buttons, terminal blocks, changelogs, system diagrams, command references.
10. Research / academic writer: citations, footnotes, reading lists, formal typography, publication metadata.
11. Magazine / news-like publisher: featured story hierarchy, category streams, issue-like layouts, topic landing pages.
12. Family / hobby journal: friendly, warm templates without infantilizing the design.

The system must make these identities selectable through a high-quality theme and content-preset system rather than hardcoded forks.

---

# Hard constraints

Use these architectural principles:

- Content is versioned in Git and human-readable in the repository.
- Public pages are statically generated at build time.
- No visitor login, comments, personalized feeds, live dashboards, or real-time collaboration in version 1.
- A creator-facing workspace may authenticate through GitHub OAuth or a Git-based CMS integration, but it must commit content to the repository rather than persist it in a database.
- Every mutable authoring action must have a clear persistence model: local browser draft, Git commit, pull request, or deployed production version.
- Avoid saying the product has a backend just because a Vercel deployment runs. Keep the core static-first.
- Use progressive enhancement: the public website must remain readable and useful without JavaScript.
- The creator workspace may use JavaScript heavily because it is an authenticated authoring experience, but loading it must not damage public performance.
- Do not promise perfect Lighthouse scores. Specify measurable targets, test procedures, and realistic performance budgets instead.
- Do not assume a nonexistent Astro, Tailwind, Tiptap, or Vercel version. Use stable-current dependencies and record them in a lockfile after implementation.

---

# Required platform recommendation

Evaluate the following implementation choices briefly, then select one and justify it against the constraints:

- Astro with Content Collections and MDX.
- Next.js static export with MDX.
- Hugo.
- Eleventy.

The selected solution should prioritize:

- Content-heavy static publishing.
- Extremely low default client-side JavaScript.
- Component-rich themed layouts.
- TypeScript safety.
- MDX / Markdown workflows.
- Image optimization and accessible responsive media.
- Reusable modular components.
- Easy Vercel deployment.
- A practical future route to richer creator tools without rebuilding the public frontend.

Default recommendation: use **Astro + TypeScript + MDX + Content Collections + Tailwind CSS + small isolated React islands only where interactivity is necessary**. Do not treat that default as unquestionable: validate it in the rationale.

---

# Multi-site and update model

Design a model that supports both of the following modes.

## Mode A — Single-site starter

One repository, one Vercel project, one custom domain, one creator. This is the easiest bootstrap path.

## Mode B — White-label fleet

A central engine repository provides the reusable codebase. Each customer or creator owns a separate instance repository and Vercel project with its own domain. The instance repository stores its own content and brand configuration.

The white-label model must meet these requirements:

- `faulhenrik.hu` and `itadminblog.com` are independent top-level domains, not forced subdomains under a shared host.
- A site can choose which engine release it adopts.
- An engine security fix can be distributed to all eligible instances.
- A breaking visual redesign is opt-in rather than silently overwriting a creator’s custom work.
- Instance-specific custom components may be allowed under an explicit extension boundary.
- Updates must remain auditable and reviewable using branches, pull requests, changelogs, and release tags.

Compare these choices:

1. Git template repository plus periodic update scripts.
2. Monorepo with one app build per tenant and environment-selected configuration.
3. Shared npm package for engine components plus an instance repository for configuration/content.
4. Git submodules.
5. Git subtree.

Recommend a phased answer, likely:

- Start with a template repository for fastest launch.
- Extract stable core packages later into a versioned private/public package or a Git-based dependency.
- Preserve clear upgrade boundaries using `site.config.ts`, content folders, theme tokens, and documented overrides.

Explain exactly which files belong in the core engine, which belong to instances, and which must never be overwritten by a bulk update.

---

# Canonical content model

Define a strict typed content model that remains portable and readable without the app.

Use Markdown/MDX files with validated frontmatter. Explain why raw HTML must be either prohibited or sanitized and why arbitrary executable MDX should be constrained for nontechnical creators.

Specify these content collections:

- `posts`: general articles.
- `pages`: static pages such as About, Contact, Privacy, Imprint.
- `projects`: case studies, portfolio works, trips, recipes, or professional projects.
- `authors`: one or more authors.
- `categories`: controlled taxonomy.
- `tags`: optional flexible taxonomy.
- `series`: ordered article sequences.
- `site`: singleton global configuration.
- `theme`: singleton selected theme and visual preferences.
- `navigation`: header and footer navigation configuration.
- `media`: optional image metadata manifest if needed.

For a post, define fields including:

- title
- slug
- excerpt
- publishedAt
- updatedAt
- status: draft, review, scheduled metadata only, published, archived
- author
- categories
- tags
- hero image object
- hero treatment
- theme or post style override
- reading-time metadata generated at build time
- canonical URL override
- SEO title and description override
- Open Graph image override
- featured flag
- pinned flag
- series entry reference and order
- related posts manual references
- content layout options
- gallery blocks or embedded MDX components
- location object for travel content, optional and privacy-aware
- recipe object for cooking content, optional
- project object for portfolio / work content, optional
- accessibility alt text requirements for every editorial image

Include Zod schema examples, validation error strategy, slug collision prevention, date handling in ISO 8601, and a migration policy when schemas evolve.

---

# Creator workspace concept

Do not call the editor an “admin.” Use **Creator Workspace** everywhere: UI labels, route names, documentation, permission language, and code comments where appropriate.

Design the Creator Workspace as an optional authenticated app at `/creator/`. It is a control room for the owner of one static site, not a public visitor feature.

It must contain:

- A dashboard with draft, review, published, and recently changed content.
- A content library with search, filters, sorting, and quick status actions.
- A post composer with a block-oriented writing model.
- A right-side settings inspector for metadata, SEO, hero media, layout, category, tags, and publishing state.
- Desktop, tablet, and mobile preview modes.
- Revision awareness: show local unsaved state, pending Git commit, Git branch/PR state when available, and the last deployed version.
- Safe save behavior: save locally automatically, explicitly commit/publish only after confirmation.
- Restore workflow: identify a Git revision before restoring; show a diff summary; never silently overwrite current local changes.
- Theme explorer with visually rich cards, live mock previews, type scale, color palette, and suitability labels.
- Brand editor for logo, name, social profiles, navigation, colors, type selection, and global visual settings.

Make a distinction among these states:

| State | Canonical location | Meaning |
|---|---|---|
| Local draft | Browser storage | Uncommitted temporary work, recoverable on the same device/browser |
| Repository draft | Git branch / content file | Durable content awaiting review or publication |
| Preview deployment | Vercel preview URL | Site version built from a branch or pull request |
| Production | Main branch + production Vercel deployment | Public canonical content |

Explicitly call out that a browser-only draft cannot guarantee cross-device recovery without a backend or Git commit.

---

# Image and gallery strategy

Design a static-compatible image workflow that does not falsely claim unlimited server-side media management.

Support:

- Hero images.
- Inline images.
- Captions and credits.
- Image focus point / crop intention metadata.
- Decorative images marked appropriately so they do not create noisy alt text.
- Featured visual pull quotes.
- Responsive image dimensions and aspect ratio reservation.
- Lightbox view with keyboard access.
- Several gallery layouts: editorial grid, masonry-like balanced grid, justified rows, carousel, stacked story, comparison/before-after, filmstrip, full-bleed chapter break, and horizontally scrollable mobile gallery.
- Per-gallery controls: aspect ratio, gaps, ordering, caption display, click behavior, border radius, background, and desktop/mobile behavior.

For strict GitHub + Vercel, provide two viable media modes:

1. **Git-managed media**: uploaded images are committed to the instance repository under an assets directory. This is the version-1 default for predictable canonical content and Git history.
2. **Optional Vercel Blob media**: only if the implementation can secure upload token generation without creating a permanent backend or exposing a token. Clearly document tradeoffs, cost, data ownership, backup requirements, and how URLs are kept stable.

The implementation plan must choose Git-managed media as baseline and make Blob an explicit future optional capability.

---

# Theme system specification

Create a token-based theme system with an unchanging semantic component API. Themes may alter visual expression but should not require every page to be rewritten.

At minimum, specify 24 theme presets, grouped by intent:

- Clean minimal light
- Clean minimal dark
- Editorial serif
- Swiss grid
- Soft journal
- Brutalist
- Cyber terminal
- Neon cyberpunk
- Glass future
- Holographic / iridescent
- Developer console
- AI lab
- Travel atlas
- Outdoor expedition
- Food journal
- Recipe studio
- Photo portfolio
- Art gallery
- Music night
- Gaming arena
- Corporate authority
- Industrial workshop
- Academic paper
- Magazine newsroom
- Luxury fashion
- Nature organic
- Family storybook
- Retro 1980s

Each theme must define:

- Semantic colors: canvas, surface, surface-raised, text, muted text, border, primary, secondary, success, warning, danger, focus ring.
- Typography: display, headline, body, mono, metadata.
- Type scale and line-height.
- Spacing and layout density.
- Corner radius and border treatment.
- Shadow, blur, gradient, texture, and motion rules.
- Component variants: header, navigation, cards, buttons, code, figures, article body, TOC, forms, callouts, footer.
- Dark/light behavior, if applicable.
- Reduced-motion behavior.
- Contrast guarantees and accessible alternate palettes.

Explain how a theme is selected globally, overridden per page where sensible, previewed before change, and rolled back.

---

# UX quality bar

The visual direction must feel premium and intentional, not a pile of effects. Establish these rules:

- Typography leads the experience.
- Motion supports orientation and feedback, not decoration.
- Every high-motion or canvas-heavy theme has a performant, static, reduced-motion fallback.
- Avoid gratuitous cursor trails, autoplay audio, inaccessible scroll-jacking, unreadable low-contrast glass panels, and unbounded animation loops.
- Mobile is not a collapsed desktop layout; it has its own layout rules.
- The default reading width should be comfortable, with intentional exceptions for visual stories and galleries.
- The creator sees accurate previews for breakpoints and theme choices.
- Theme identity should coexist with a predictable content hierarchy.

---

# Security and trust model

Define the threat model for a static blog engine with a creator workspace.

Cover:

- GitHub OAuth or Git-based CMS authentication and minimum repository permissions.
- Repository branch protection.
- Pull request approvals for teams.
- Secret handling in Vercel environment variables.
- No secrets inside frontend bundles or committed configuration.
- Dependency update policy.
- Content sanitization for rich text / embedded HTML.
- CSP design appropriate for a static Astro site.
- Image file type and size validation.
- Preventing unsafe embed URLs.
- Protection from accidental mass content deletion through confirmation, previews, and Git recovery.
- Backup plan: Git clone, GitHub exports, Vercel deployment history, and media backup.
- Custom-domain ownership and DNS changes.

Use a threat/risk/mitigation table.

---

# Performance, accessibility and SEO

Specify a serious quality plan.

Performance budgets:

- Public initial JavaScript should be near zero on article pages unless a user opens an interactive feature.
- Use responsive, optimized images with known dimensions.
- Avoid client-side hydration for static content blocks.
- Lazy-load below-the-fold galleries and nonessential embeds.
- Self-host or optimize fonts where practical.
- Use static HTML page output, cache-friendly immutable assets, and build-time data derivations.
- Track LCP, CLS, INP, total JavaScript, image bytes, and font bytes in CI or post-deployment checks.

Accessibility:

- WCAG 2.2 AA target.
- Keyboard navigation, focus visibility, skip link, semantic landmarks, valid heading order, accessible dialogs, gallery keyboard controls, color contrast, caption support, form labels, errors, reduced motion, screen-reader announcement where dynamic state changes.
- Do not use color alone for status.

SEO:

- Per-route canonical URL.
- Metadata fallback hierarchy.
- Open Graph and social card image strategy.
- JSON-LD for WebSite, Person/Organization, Blog, BlogPosting, BreadcrumbList, Recipe where applicable, and potentially CreativeWork / ImageGallery for visual projects.
- Sitemap, RSS, robots policy, pagination, tag/category canonicalization, pagination metadata, noindex for drafts and Creator Workspace routes.
- Include a strategy for custom domains so canonical URLs are correct per instance.

---

# Deliverable format

Return the architecture in these sections, in exactly this order:

1. Executive decisions and non-goals.
2. System context diagram in Mermaid.
3. Repository and deployment topology.
4. Recommended framework rationale and rejected alternatives.
5. Complete folder structure for core and instance repositories.
6. Typed content model with representative Zod schemas.
7. Creator Workspace information architecture.
8. Theme engine and preset catalogue.
9. Image/media model and gallery model.
10. Custom-domain and white-label update strategy.
11. Git workflow: local draft, branch, preview, production, rollback.
12. Security model and risk table.
13. Performance, accessibility, and SEO acceptance criteria.
14. Milestones: foundation, public experience, Creator Workspace, fleet operations.
15. A concise “implementation handoff checklist” for a coding agent.

Use tables whenever comparisons reduce ambiguity. Be concrete: provide names, folder paths, data shapes, acceptance tests, and failure modes. Do not produce application code yet beyond small schemas/config examples. This document is the source-of-truth blueprint for the next implementation prompts.
