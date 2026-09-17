# Prompt 08 — Performance, Accessibility, and SEO Excellence

## Copy-ready prompt

You are a web performance engineer, accessibility specialist, and technical SEO expert. Build the **Performance, Accessibility, and SEO** foundation for ForgeBlog, a static-first, GitHub + Vercel-only blog engine.

The goal is to achieve exceptional real-world performance, inclusive accessibility, and strong organic discoverability without compromising the static, backend-free architecture.

---

# Performance philosophy

ForgeBlog must be fast by default, not by accident.

Principles:

- Ship minimal JavaScript to public pages.
- Use static HTML and CSS as the primary delivery mechanism.
- Optimize images and fonts aggressively.
- Measure performance with real tools and budgets, not guesses.
- Treat performance as a feature, not an afterthought.

---

# Performance budgets

Define and enforce these budgets:

## JavaScript

- Total JavaScript on article pages: <50KB gzipped by default.
- Interactive islands only where truly needed (search, gallery, code copy).
- No client-side router or SPA shell for public content.

## CSS

- Critical CSS inlined where beneficial.
- Total CSS: <100KB gzipped for most themes.
- Unused CSS purged via Tailwind or custom tooling.

## Images

- LCP image: <150KB for typical hero images.
- Total image bytes per page:
  - Text-heavy post: <500KB.
  - Visual story: <2MB.
- All images responsive with srcset and explicit dimensions.

## Fonts

- Total font bytes: <200KB for typical themes.
- Use `font-display: swap` or `optional`.
- Subset fonts where practical.
- Avoid loading multiple heavy display fonts on the same page.

## HTML

- Initial HTML document: <100KB uncompressed.
- Avoid deeply nested DOM trees.
- Keep heading hierarchy shallow and semantic.

---

# Core Web Vitals targets

Target these metrics on production deployments:

- **LCP (Largest Contentful Paint)**: <2.0s on 4G, <1.2s on fast connections.
- **INP (Interaction to Next Paint)**: <150ms for typical interactions.
- **CLS (Cumulative Layout Shift)**: <0.05, ideally 0.
- **FCP (First Contentful Paint)**: <1.2s.
- **TTFB (Time to First Byte)**: <200ms from Vercel edge.

Implement monitoring:

- Use Vercel Analytics or open-source alternatives.
- Track real-user metrics where practical.
- Set up alerts for regressions.

---

# Optimization strategies

## Static generation

- Pre-render all public pages at build time.
- Avoid server-side rendering for content pages.
- Use incremental static regeneration only if clearly beneficial and well-understood.

## JavaScript minimization

- Use Astro’s islands architecture to keep most pages JavaScript-free.
- Hydrate interactive components only when:
  - User interacts with them.
  - They become visible.
  - They are essential for initial interaction.
- Avoid large client-side libraries for static content.

## Image optimization

- Convert images to WebP/AVIF with fallbacks.
- Generate responsive srcset.
- Use explicit width and height to prevent layout shift.
- Lazy-load below-the-fold images.
- Prioritize LCP image with `fetchpriority="high"` where appropriate.

## Font optimization

- Self-host fonts when practical.
- Use `preconnect` for font hosts.
- Subset fonts to used character sets.
- Use system font fallbacks to avoid invisible text.

## CSS optimization

- Use utility CSS with purging (Tailwind).
- Inline critical CSS for above-the-fold content.
- Defer non-critical CSS.
- Avoid large CSS frameworks that ship unused styles.

## Caching and CDN

- Leverage Vercel’s global CDN.
- Set long cache lifetimes for immutable assets.
- Use content-hashed filenames for cache busting.
- Configure Cache-Control headers appropriately.

---

# Accessibility philosophy

ForgeBlog must be usable by everyone, regardless of ability or device.

Target WCAG 2.2 AA as a baseline. Treat accessibility as a quality gate, not a nice-to-have.

---

# Semantic HTML

Use semantic elements consistently:

- `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`.
- Proper heading hierarchy: one `<h1>` per page, logical `<h2>`–`<h6>` structure.
- Lists for navigation and content lists.
- `<figure>` and `<figcaption>` for images and galleries.
- `<time>` for dates with machine-readable datetime attributes.
- `<button>` for actions, `<a>` for navigation.

Avoid:

- Divs and spans where semantic elements exist.
- Fake interactive controls built from non-interactive elements.
- Broken heading order for visual styling.

---

# Keyboard accessibility

Ensure full keyboard operability:

- All interactive elements focusable with Tab.
- Logical focus order matching visual order.
- Visible focus indicators on all interactive elements.
- Escape closes dialogs, menus, and overlays.
- Enter/Space activates buttons and links.
- Arrow keys navigate menus, galleries, and carousels where appropriate.
- Skip link to main content.

---

# Screen reader support

Optimize for assistive technologies:

- Meaningful alt text for all content images.
- Decorative images marked appropriately.
- ARIA labels where native semantics are insufficient.
- Landmark roles where HTML5 semantics need reinforcement.
- Announce dynamic content changes with `aria-live` where appropriate.
- Provide text alternatives for non-text content.

---

# Color and contrast

Ensure readable color combinations:

- Text/background contrast ratio ≥4.5:1 for normal text.
- ≥3:1 for large text and UI components.
- Do not rely solely on color to convey meaning.
- Provide focus ring visible on all backgrounds.
- Test themes with color blindness simulators.

---

# Motion and animation

Respect user preferences:

- Honor `prefers-reduced-motion: reduce`.
- Provide no-motion equivalents for all animations.
- Avoid auto-playing motion that cannot be paused.
- Ensure motion does not cause disorientation or nausea.

---

# Forms and inputs

Make forms accessible:

- Labels associated with inputs via `for`/`id`.
- Clear error messages linked to inputs.
- Error prevention and confirmation for destructive actions.
- Instructions and examples where needed.
- Accessible date and time inputs.

---

# SEO philosophy

ForgeBlog must be discoverable and indexable by search engines while remaining honest about its static nature.

---

# Technical SEO foundation

## Crawlability

- Clean, semantic URLs.
- No JavaScript-required navigation for primary content.
- Sitemap XML with all public pages.
- Robots.txt allowing appropriate crawling.
- No accidental noindex on production pages.

## Indexation

- Unique, descriptive titles per page.
- Unique meta descriptions.
- Canonical URLs preventing duplicates.
- Proper pagination handling.
- Noindex for drafts, previews, and admin/creator routes.

## Structured data

Implement JSON-LD for:

- `WebSite` with search action if search is available.
- `Person` or `Organization` for site owner.
- `Blog` for blog listing pages.
- `BlogPosting` or `Article` for posts.
- `BreadcrumbList` for navigation breadcrumbs.
- `Recipe` for recipe content.
- `ImageObject` or `ImageGallery` for visual content where appropriate.

Validate structured data with Google’s testing tools.

---

# On-page SEO

## Titles

- Unique per page.
- Include primary keywords naturally.
- Length: 50–60 characters typically.
- Site name appended consistently.

## Descriptions

- Unique per page.
- Compelling summary of content.
- Length: 140–160 characters typically.
- Include relevant keywords naturally.

## Headings

- One H1 per page, describing main topic.
- Logical H2–H6 hierarchy.
- Include keywords where natural, not forced.

## Content

- High-quality, original content.
- Clear structure with headings and lists.
- Internal linking to related content.
- External links to authoritative sources where appropriate.

## URLs

- Short, descriptive, and readable.
- Hyphen-separated words.
- No unnecessary parameters.
- Consistent structure across site.

---

# Image SEO

- Descriptive filenames.
- Meaningful alt text.
- Captions and credits where relevant.
- Responsive images for all devices.
- Image sitemap or inclusion in main sitemap where appropriate.

---

# Social sharing optimization

Implement Open Graph and Twitter Card metadata:

- Title, description, and image for social shares.
- Site name and author where relevant.
- Card type appropriate to content.
- Test with social platform preview tools.

---

# Performance and SEO tooling

Integrate these tools into the development workflow:

## Local development

- Lighthouse audits in Chrome DevTools.
- axe DevTools for accessibility.
- WAVE or similar for visual accessibility inspection.
- PageSpeed Insights for field data comparison.

## CI/CD

- Lighthouse CI or similar for performance regression detection.
- axe-core or pa11y for automated accessibility checks.
- Custom scripts for SEO metadata validation.

## Monitoring

- Vercel Analytics or open-source alternatives for real-user metrics.
- Search Console for indexing and search performance.
- Error tracking for JavaScript failures where applicable.

---

# Output requirements

Return:

1. Performance budget configuration and enforcement utilities.
2. Image and font optimization pipelines.
3. Accessibility audit checklist and test fixtures.
4. Semantic HTML templates for all page types.
5. Structured data generation code.
6. SEO metadata builder and validation.
7. Social sharing metadata implementation.
8. CI/CD integration for performance and accessibility checks.
9. Monitoring and alerting setup guidance.
10. Documentation for creators on writing accessible, SEO-friendly content.

The final implementation must make excellent performance, accessibility, and SEO the default, not an optional optimization pass.