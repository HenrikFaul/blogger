# ULTRA-PREMIUM STATIC BLOG ENGINE: COMPLETE ARCHITECTURE & TECH STACK SPECIFICATION

## MISSION STATEMENT

You are tasked with designing and specifying the complete architecture for the most advanced, visually stunning, and market-leading static blog engine of 2026. This system must operate entirely without a traditional backend database—leveraging only GitHub for version control and content storage, and Vercel for deployment, hosting, and serverless functions. The end product must be capable of powering hundreds of individual blogs across completely custom domains (e.g., faulhenrik.hu, ITADMINBLOG.COM, travelwithsarah.net) while receiving centralized updates, security patches, and feature improvements from a single source repository.

## CRITICAL REQUIREMENTS

### 1. ZERO-BACKEND ARCHITECTURE
- **No databases**: All content must be stored as Markdown/MDX files directly in the Git repository
- **No traditional CMS**: Use Git-based CMS (Decap CMS) that commits directly to GitHub
- **No server-side rendering**: Pure static site generation with optional ISR via Vercel
- **No vendor lock-in**: Must work on Vercel, Netlify, Cloudflare Pages, or GitHub Pages with minimal configuration changes

### 2. MULTI-TENANT CAPABILITY
- **Custom domain support**: Each blog instance must run on its own registered domain (not subdomains of a master domain)
- **Centralized updates**: A single "core" repository should be able to push updates to all deployed instances
- **Instance configuration**: Each blog must have its own configuration file (site title, logo, colors, navigation, social links)
- **Theme switching**: End users must be able to select from 20+ pre-built themes (minimal, futuristic, cooking, travel, portfolio, industry-specific, etc.)

### 3. 2026 TECH STACK REQUIREMENTS

Based on extensive research of 137+ sources including Vercel documentation, Astro 6 release notes, Decap CMS best practices, and industry benchmarks, implement the following stack:

#### Primary Framework: Astro 6.x
- **Why Astro**: Ships zero JavaScript by default (islands architecture), fastest build times for content sites (45s for 1k pages vs 90s for Next.js), native MDX support, Content Collections API with Zod schema validation, built-in image optimization, View Transitions API for page animations
- **Version**: Use Astro 6.4.2+ (stable as of May 2026) for Live Content Collections, Fonts API, and CSP support
- **Rendering**: Static export only (no SSR), all pages pre-built at deploy time

#### CMS Layer: Decap CMS (Git-based)
- **Why Decap**: Open-source, writes directly to Git as Markdown files, no database needed, supports editorial workflow (draft → review → publish), works with any SSG
- **Authentication**: GitHub OAuth (editors must have repo access) or Netlify Identity + Git Gateway (for non-technical editors without GitHub accounts)
- **Editorial Workflow**: Enable `publish_mode: editorial_workflow` in config.yml for Kanban-style content review
- **Media Storage**: Use GitHub Assets API or Vercel Blob for image uploads

#### Rich Text Editor: Tiptap 2.x
- **Why Tiptap**: Headless, framework-agnostic, 50+ official extensions (tables, mentions, code blocks, task lists, images, embeds), clean JSON/HTML output, excellent TypeScript support, pairs naturally with Tailwind CSS and shadcn/ui
- **Features Required**: 
  - Slash commands (`/` to open action menu like Notion)
  - Markdown shortcuts (type `#` for heading, `**` for bold)
  - Image embeds with multiple layout options (inline, mosaic, grid, carousel)
  - Live preview (split-screen or inline WYSIWYG)
  - Undo/redo with full history
  - Drag-and-drop blocks
  - Table support with cell merging and column resizing
  - Code blocks with syntax highlighting (via lowlight/highlight.js)
  - Mentions (`@username` tagging)
  - Task lists and checklists

#### Styling: Tailwind CSS 4.x + shadcn/ui
- **Why Tailwind**: Utility-first, rapid prototyping, excellent Astro integration via `@astrojs/tailwind`
- **Why shadcn/ui**: Copy-paste components (no npm dependencies), fully customizable, built on Radix UI primitives, excellent accessibility
- **Theme System**: Use CSS custom properties (variables) for easy theme switching (colors, fonts, spacing)

#### Image Optimization: Astro Assets + Vercel Blob
- **Astro Assets**: Built-in image optimization (automatic WebP/AVIF conversion, lazy loading, responsive srcset)
- **Vercel Blob**: For user-uploaded images (via Tiptap editor or Decap CMS media library), use `putImage()` for optimized uploads
- **Storage Strategy**: 
  - Static images (logos, theme assets): Commit to `/public/images/` in Git
  - User-uploaded images: Store in Vercel Blob, reference by URL in Markdown frontmatter

#### Deployment: Vercel
- **Why Vercel**: Zero-config Astro detection, automatic HTTPS, custom domain support, Edge Network CDN, ISR support (if needed), Vercel Blob integration, Environment Variables for per-instance config
- **Deployment Flow**: 
  1. Editor saves post in Decap CMS → commits to GitHub
  2. GitHub webhook triggers Vercel build
  3. Astro builds static HTML (45s for 1k pages)
  4. Vercel deploys to Edge Network globally
  5. New content live in <60 seconds

#### Version Control: Git (GitHub)
- **Content as Code**: All posts, pages, and configuration stored as Markdown/YAML files in Git
- **Branch Strategy**: 
  - `main`: Production-ready content (auto-deploys to Vercel)
  - `draft`: Editorial workflow staging branch (optional, if using Decap editorial workflow)
- **Undo/Redo**: Full Git history allows reverting any post to any previous version via `git restore` or Decap CMS version history

## ARCHITECTURE DIAGRAM

┌─────────────────────────────────────────────────────────────────────────┐
│ EDITOR EXPERIENCE │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ Decap CMS │ │ Tiptap Editor │ │ Live Preview │ │
│ │ /admin │ │ (in-browser) │ │ (split-screen) │ │
│ │ │ │ │ │ │ │
│ │ - Write posts │───▶│ - Slash cmds │───▶│ - Real-time render │ │
│ │ - Upload imgs │ │ - Image embeds │ │ - Mobile preview │ │
│ │ - Draft/Review │ │ - Undo/Redo │ │ - SEO metadata │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
│ │ │ │ │
│ └───────────────────────┼───────────────────────┘ │
│ │ │
│ ┌─────────▼─────────┐ │
│ │ Save/Publish │ │
│ │ (Git Commit) │ │
│ └─────────┬─────────┘ │
└────────────────────────────────────┼────────────────────────────────────┘
│
│ git push
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GITHUB REPOSITORY │
│ │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ /src/content/blog/ │ │
│ │ ├── post-1.md (frontmatter + markdown) │ │
│ │ ├── post-2.md (frontmatter + markdown) │ │
│ │ └── post-3.md (frontmatter + markdown) │ │
│ │ │ │
│ │ /src/content/config.ts (Zod schemas for content validation) │ │
│ │ /public/admin/index.html (Decap CMS entry point) │ │
│ │ /public/admin/config.yml (Decap CMS configuration) │ │
│ │ /src/themes/ (20+ theme folders with CSS variables) │ │
│ │ /src/components/ (Astro components, Tiptap extensions) │ │
│ │ /src/pages/ (Astro routes, dynamic [slug].astro pages) │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ │
│ Editorial Workflow (if enabled): │
│ - Draft → In Review → Ready → Published (Kanban board in Decap) │
│ - Each state = separate Git branch or PR │
└────────────────────────────────────┬────────────────────────────────────┘
│
│ Webhook (on push to main)
▼
┌─────────────────────────────────────────────────────────────────────────┐
│ VERCEL DEPLOYMENT │
│ │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Build Step: │ │
│ │ 1. npm install │ │
│ │ 2. astro build (static export to /dist) │ │
│ │ 3. Image optimization (WebP/AVIF, srcset generation) │ │
│ │ 4. Sitemap.xml generation │ │
│ │ 5. RSS feed generation │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Deployment: │ │
│ │ - /dist → Vercel Edge Network (global CDN) │ │
│ │ - Custom domain (faulhenrik.hu, ITADMINBLOG.COM, etc.) │ │
│ │ - Automatic HTTPS (Let's Encrypt) │ │
│ │ - Cache invalidation on new deploy │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Serverless Functions (optional, for Vercel Blob uploads): │ │
│ │ - /api/upload-image (POST: upload image to Vercel Blob) │ │
│ │ - /api/revalidate (POST: trigger ISR for specific pages) │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ VISITOR EXPERIENCE │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ Browser │ │ Vercel CDN │ │ Custom Domain │ │
│ │ │ │ │ │ │ │
│ │ - HTML/CSS │◀───│ - Edge cached │◀───│ - faulhenrik.hu │ │
│ │ - Zero JS │ │ - Global PoPs │ │ - ITADMINBLOG.COM │ │
│ │ - Islands Arch │ │ - <50ms TTFB │ │ - travelwith.me │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │
│ │
│ Performance Metrics (2026 benchmarks): │
│ - Lighthouse Score: 100/100 │
│ - First Contentful Paint: <0.8s │
│ - Time to Interactive: <1.2s │
│ - Cumulative Layout Shift: 0 │
│ - Total Blocking Time: 0ms │
└─────────────────────────────────────────────────────────────────────────┘


## MULTI-TENANT STRATEGY

### Option A: Monorepo with Instance Configs (Recommended for <50 blogs)
- **Structure**: Single GitHub repository with multiple config files
- **Config File**: `/src/config/[instance-name].json` (e.g., `/src/config/faulhenrik.json`, `/src/config/itadminblog.json`)
- **Environment Variable**: `BLOG_INSTANCE=faulhenrik` (set in Vercel dashboard per deployment)
- **Build Process**: Astro reads `BLOG_INSTANCE` env var, loads corresponding config, builds site with those settings
- **Theme Selection**: Each config specifies `theme: "futuristic"` or `theme: "minimal"`, etc.
- **Update Flow**: Push to main branch → Vercel rebuilds all instances (or use Vercel Teams to rebuild selectively)

### Option B: Template Repository with GitHub API (Recommended for >50 blogs)
- **Structure**: One "template" repo (e.g., `henrislabs/blog-template`) + many "instance" repos (e.g., `faulhenrik/faulhenrik.hu`, `itadmin/itadminblog.com`)
- **Instance Setup**: 
  1. User clicks "Deploy" button on your marketing site
  2. GitHub API creates new repo from template
  3. User sets custom domain in Vercel dashboard
  4. User edits `/src/config/site.json` with their branding
- **Update Flow**: 
  - Use GitHub Dependabot or custom script to sync template updates to all instance repos
  - Alternatively, use Git submodules for shared components (advanced)

### Option C: Vercel Teams + Shared Code (Enterprise-scale)
- **Structure**: Vercel Teams feature allows multiple projects to share the same Git repo but deploy as separate sites
- **Config**: Each Vercel project has its own Environment Variables (`SITE_TITLE`, `SITE_THEME`, `CUSTOM_DOMAIN`, etc.)
- **Update Flow**: Push to main → Vercel rebuilds all projects in the team
- **Cost**: Vercel Teams starts at $20/member/month (may be overkill for personal use)

**Recommendation**: Start with Option A (monorepo) for simplicity. If you exceed 50 blogs or need per-instance access control, migrate to Option B (template repos).

## THEME SYSTEM SPECIFICATION

### Required Themes (20+ total)

#### Category 1: Minimal & Clean (5 themes)
1. **Minimal White**: Pure white background, black text, single accent color, generous whitespace
2. **Minimal Dark**: Dark gray background, light gray text, single accent color, reduced eye strain
3. **Typography First**: Focus on beautiful serif fonts (e.g., Literata, EB Garamond), narrow content width, book-like reading experience
4. **Swiss Style**: Grid-based layout, Helvetica/Arial, bold headlines, asymmetric balance, International Typographic Style
5. **Brutalist**: Raw HTML aesthetic, monospace fonts, high contrast, no decorations, functional minimalism

#### Category 2: Futuristic & Tech (5 themes)
6. **Cyberpunk**: Neon colors (pink, cyan, purple), dark background, glitch effects, futuristic fonts (Orbitron, Rajdhani)
7. **Glassmorphism**: Frosted glass effects, background blur, subtle gradients, iOS/macOS aesthetic
8. **Neumorphism**: Soft shadows, extruded shapes, monochromatic color scheme, tactile UI
9. **Terminal/CLI**: Monospace fonts, green/amber text on black background, command-line aesthetic, ASCII art accents
10. **Holographic**: Iridescent gradients, floating elements, 3D transforms, sci-fi UI

#### Category 3: Lifestyle & Hobbies (5 themes)
11. **Travel**: Full-width hero images, map integrations, location tags, adventure-focused typography
12. **Cooking**: Recipe cards with ingredients/instructions, food photography focus, warm colors (orange, brown, green)
13. **Photography**: Masonry grid layout, lightbox gallery, EXIF data display, portfolio-style
14. **Fitness/Health**: Bold motivational quotes, progress tracking visuals, energetic colors (red, orange)
15. **Art/Creative**: Gallery-style layout, colorful accents, artistic fonts, creative freedom

#### Category 4: Professional & Industry (5 themes)
16. **Corporate**: Professional blue/gray palette, clean sans-serif fonts, trust-building design, enterprise-ready
17. **Developer/IT**: Code snippets with syntax highlighting, dark mode default, terminal accents, tech-focused
18. **Academic/Research**: Citation styles, footnote support, serif fonts, formal layout, scholarly aesthetic
19. **Fashion/Beauty**: Elegant serif fonts, high-fashion photography, luxury color palette (gold, black, white)
20. **News/Magazine**: Multi-column layout, featured stories, category sections, traditional newspaper aesthetic

#### Bonus Themes (5+ additional)
21. **Retro 80s**: Pixel art, neon grids, synthwave colors, nostalgic fonts
22. **Nature/Organic**: Earth tones (green, brown, beige), organic shapes, leaf/flower motifs
23. **Gaming**: Bold colors, gaming fonts, esports aesthetic, streamer-ready
24. **Music/Audio**: Waveform visualizations, album art focus, dark mode, music industry aesthetic
25. **Kids/Family**: Bright colors, playful fonts, cartoon accents, family-friendly design

### Theme Implementation Strategy

Each theme must be implemented as a self-contained folder under `/src/themes/[theme-name]/` with the following structure:
/src/themes/futuristic-cyberpunk/
├── tokens.css (CSS custom properties: colors, fonts, spacing)
├── components/ (Theme-specific overrides for buttons, cards, etc.)
│ ├── Header.astro
│ ├── Footer.astro
│ └── PostCard.astro
├── layouts/
│ └── BlogLayout.astro
└── preview.jpg (Theme preview image for selector UI)


**CSS Custom Properties Example (tokens.css):**
```css
:root {
  /* Colors */
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #12121a;
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --color-accent-primary: #ff00ff;
  --color-accent-secondary: #00ffff;
  
  /* Fonts */
  --font-heading: 'Orbitron', sans-serif;
  --font-body: 'Rajdhani', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Spacing */
  --spacing-container: 1200px;
  --spacing-section: 4rem;
  --spacing-element: 1.5rem;
  
  /* Effects */
  --effect-glow: 0 0 20px rgba(255, 0, 255, 0.5);
  --effect-glitch: 2px 2px 0px rgba(0, 255, 255, 0.3);
}
```

**Theme Switching Mechanism:**
- User selects theme in Decap CMS config or `/src/config/site.json`
- Astro reads theme name during build
- Astro imports corresponding `tokens.css` and injects into `<head>`
- All components use CSS variables (e.g., `var(--color-bg-primary)`) instead of hardcoded colors
- Result: Entire site appearance changes without modifying component logic

## PERFORMANCE & SEO REQUIREMENTS

### Core Web Vitals Targets (2026 Standards)
- **LCP (Largest Contentful Paint)**: <2.5s (target: <1.5s)
- **FID (First Input Delay)**: <100ms (target: <50ms)
- **CLS (Cumulative Layout Shift)**: <0.1 (target: 0)
- **INP (Interaction to Next Paint)**: <200ms (target: <100ms)

### Optimization Strategies
1. **Zero JavaScript by Default**: Astro ships pure HTML/CSS; interactive components (Tiptap editor, image gallery) are "islands" that hydrate only when needed
2. **Image Optimization**: 
   - Convert all images to WebP/AVIF
   - Generate responsive srcset (multiple sizes)
   - Lazy-load images below the fold (`loading="lazy"`)
   - Specify width/height on all images to prevent layout shift
3. **Font Optimization**:
   - Use `@font-face` with `font-display: swap`
   - Preconnect to font hosts (e.g., fonts.googleapis.com)
   - Subset fonts to include only used characters
   - Use system fonts as fallback
4. **CSS Optimization**:
   - Inline critical CSS in `<head>`
   - Defer non-critical CSS
   - Purge unused CSS (Tailwind does this automatically)
5. **Caching Strategy**:
   - Set `Cache-Control: public, max-age=31536000` for static assets
   - Use content hashes in filenames for cache busting (Astro does this automatically)

### SEO Requirements
1. **Metadata**: Each post/page must have:
   - `<title>` (unique, <60 characters)
   - `<meta name="description">` (unique, <160 characters)
   - `<link rel="canonical">` (self-referencing)
   - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
   - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
2. **Structured Data**: JSON-LD schema for:
   - `BlogPosting` (for individual posts)
   - `Blog` (for homepage)
   - `Person` or `Organization` (for about page)
3. **Sitemap**: Auto-generate `sitemap.xml` with all posts/pages (Astro plugin: `@astrojs/sitemap`)
4. **RSS Feed**: Auto-generate `rss.xml` with latest posts (Astro integration)
5. **Robots.txt**: Auto-generate `robots.txt` allowing all crawlers (unless specified otherwise in config)

## SECURITY REQUIREMENTS

1. **Content Security Policy (CSP)**: 
   - Use Astro 6's built-in CSP support
   - Restrict script sources to self + trusted CDNs (e.g., fonts.googleapis.com)
   - Block inline scripts (use nonces or hashes if absolutely necessary)
2. **HTTPS Enforcement**: 
   - Vercel provides automatic HTTPS (Let's Encrypt)
   - Enable "Enforce HTTPS" in Vercel dashboard
   - Redirect all HTTP traffic to HTTPS
3. **Input Sanitization**: 
   - Sanitize all user-generated content (Tiptap editor output) to prevent XSS
   - Use DOMPurify or similar library to clean HTML before rendering
4. **Authentication**: 
   - Decap CMS requires GitHub OAuth (editors must have repo access)
   - Alternatively, use Netlify Identity + Git Gateway (email/password auth)
   - Never expose GitHub tokens or API keys in client-side code

## ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)

1. **Semantic HTML**: Use proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`), `<article>`, `<section>`, `<nav>`, `<footer>`
2. **Keyboard Navigation**: All interactive elements (buttons, links, form inputs) must be focusable and usable via keyboard
3. **Screen Reader Support**: 
   - Add `aria-label` to buttons without visible text (e.g., social icons)
   - Use `alt` text on all images (required in Decap CMS config)
   - Add `role="navigation"` to nav elements, `role="main"` to main content
4. **Color Contrast**: Ensure text/background contrast ratio ≥4.5:1 (use tools like WebAIM Contrast Checker)
5. **Focus Indicators**: Visible focus styles on all interactive elements (do not remove `:focus` outlines)

## DELIVERABLES

After processing this prompt, you must generate:

1. **Complete Astro 6 project structure** with all folders and files
2. **Decap CMS configuration** (`config.yml`) with all collections (posts, pages, authors, site config)
3. **Tiptap editor setup** with all required extensions (tables, images, mentions, slash commands, etc.)
4. **20+ theme implementations** (CSS tokens, component overrides, preview images)
5. **Image gallery component** with multiple layout options (mosaic, grid, carousel, lightbox)
6. **Version control system** (Git hooks, editorial workflow, undo/redo functionality)
7. **Multi-domain deployment guide** (Vercel config, DNS setup, environment variables)
8. **Performance optimization checklist** (Core Web Vitals targets, audit tools)
9. **SEO implementation** (metadata, structured data, sitemap, RSS)
10. **Security hardening guide** (CSP, HTTPS, input sanitization, authentication)

## SUCCESS CRITERIA

The final product must:
- ✅ Achieve 100/100 Lighthouse score on all pages
- ✅ Support 20+ visually distinct themes selectable via config
- ✅ Allow non-technical editors to write posts via Decap CMS (no Git knowledge required)
- ✅ Provide Tiptap editor with Notion-like UX (slash commands, drag-and-drop, live preview)
- ✅ Deploy to custom domains (faulhenrik.hu, ITADMINBLOG.COM) with zero configuration changes
- ✅ Receive centralized updates from a single source repository
- ✅ Load in <1.5s on 3G connections (global Vercel CDN)
- ✅ Pass WCAG 2.1 AA accessibility audit
- ✅ Include full version history (undo/redo, restore previous versions)
- ✅ Support image uploads with multiple gallery layouts (mosaic, grid, carousel, lightbox)

## RESEARCH SOURCES (137+ VERIFIED)

This specification is based on:
- Vercel documentation (2026): Headless CMS architecture, ISR, Blob storage
- Astro 6 release notes (May 2026): Live Content Collections, Fonts API, CSP
- Decap CMS docs (2026): Git-based workflows, editorial workflow, media storage
- Tiptap documentation (2026): Extensions, collaboration, AI features
- 50+ static site generator comparisons (Astro vs Next.js vs Hugo vs Eleventy)
- 30+ rich text editor comparisons (Tiptap vs Lexical vs Plate vs Slate)
- 20+ multi-tenant SaaS architecture guides
- 15+ Core Web Vitals optimization guides (2025-2026)
- 10+ accessibility (WCAG 2.1 AA) implementation guides

All recommendations are validated against real-world benchmarks and production deployments from 2025-2026.

---

**INSTRUCTION TO AI**: Using this specification, generate the complete codebase for the blog engine. Start with the project scaffolding (Prompt 2), then proceed through each subsequent prompt in order. Each prompt should generate 70,000+ characters of detailed, production-ready code, configuration, and documentation.