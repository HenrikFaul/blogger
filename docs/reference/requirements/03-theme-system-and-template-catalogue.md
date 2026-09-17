# Prompt 03 — Theme System and Template Catalogue

## Copy-ready prompt

You are an award-winning product designer, design-systems architect, creative technologist, and Astro frontend engineer. Build the visual theme engine and reusable template catalogue for ForgeBlog, a static-first white-label blog platform built with GitHub and Vercel only.

The goal is to create a theme system that can power radically different sites—minimal essay blogs, futuristic technology publications, cooking journals, travel diaries, industrial job stories, artistic portfolios, and professional authority sites—without turning the project into unmaintainable template duplication.

This is not a request for a list of color palettes. Deliver a complete, implementation-ready architecture and production-quality code for theme registration, tokens, layouts, visual variants, theme previews, and creator-facing theme selection data.

---

# Non-negotiable principles

- Keep a stable semantic component API. A `PostCard`, `SiteHeader`, `ArticleHeader`, `Figure`, `Button`, `Gallery`, and `Footer` should remain conceptually consistent between themes.
- Theme code may override composition and styling, but it must not break content semantics, accessibility, URLs, or SEO.
- No hardcoded instance branding inside theme code.
- Themes must support custom-domain deployments without any domain-specific assumptions.
- The public website remains static-first and uses minimal client JavaScript.
- Use CSS custom properties as the primary token mechanism.
- Use progressive enhancement for optional theme interactions.
- Every theme must pass contrast and keyboard interaction requirements, including reduced-motion mode.
- Avoid generic AI “glass card everywhere” aesthetics. Each theme needs a coherent art direction and readable content hierarchy.
- Do not add a database or backend.

---

# Theme engine architecture

Implement a registry-based theme engine.

Create a stable type contract similar to:

```ts
export type ThemeKey =
  | 'minimal-editorial'
  | 'minimal-dark'
  | 'swiss-grid'
  | 'soft-journal'
  | 'brutalist'
  | 'developer-console'
  | 'cyber-neon'
  | 'glass-future'
  | 'holographic'
  | 'ai-lab'
  | 'travel-atlas'
  | 'outdoor-expedition'
  | 'food-journal'
  | 'recipe-studio'
  | 'photo-portfolio'
  | 'art-gallery'
  | 'music-night'
  | 'gaming-arena'
  | 'corporate-authority'
  | 'industrial-workshop'
  | 'academic-paper'
  | 'magazine-newsroom'
  | 'luxury-fashion'
  | 'nature-organic'
  | 'family-storybook'
  | 'retro-eighties';

export interface ThemeDefinition {
  key: ThemeKey;
  name: string;
  category: 'minimal' | 'future' | 'lifestyle' | 'professional' | 'creative' | 'retro';
  summary: string;
  idealFor: string[];
  moods: string[];
  supportsDarkMode: boolean;
  supportsUserModeToggle: boolean;
  defaultMode: 'light' | 'dark';
  preview: {
    image: string;
    alt: string;
    accentSwatches: string[];
  };
  fonts: {
    display?: string;
    heading: string;
    body: string;
    mono?: string;
  };
  features: {
    supportsImmersiveHero: boolean;
    supportsGridHomepage: boolean;
    supportsLargeMedia: boolean;
    supportsDecorativeMotion: boolean;
    preferredGalleryLayouts: string[];
  };
  tokensFile: string;
  layoutVariant: string;
  componentVariants: Record<string, string>;
}
```

Do not load theme CSS dynamically from arbitrary user values. Theme key selection must validate against the registry at build time.

Implement:

- `src/themes/registry.ts`.
- A dedicated folder per theme.
- Shared core token file.
- A CSS token contract document.
- A function to resolve the theme from site configuration.
- Safe fallback to `minimal-editorial` only during local development; production config errors should fail the build.
- `data-theme` and `data-color-mode` attributes at the document root.
- Theme-specific CSS imported in a controlled build-time manner.
- Optional compositional overrides through named slots or layout variant components.

Use static imports or a vetted import map so the build knows all themes.

---

# Token contract

Define all semantic design tokens. Components must consume semantic values, never arbitrary direct colors.

## Color tokens

- `--color-canvas`
- `--color-canvas-alt`
- `--color-surface`
- `--color-surface-raised`
- `--color-surface-inverse`
- `--color-text`
- `--color-text-muted`
- `--color-text-inverse`
- `--color-border`
- `--color-border-strong`
- `--color-primary`
- `--color-primary-contrast`
- `--color-secondary`
- `--color-accent`
- `--color-success`
- `--color-warning`
- `--color-danger`
- `--color-focus-ring`
- `--color-selection-bg`
- `--color-selection-text`

## Typography tokens

- `--font-display`
- `--font-heading`
- `--font-body`
- `--font-mono`
- `--text-xs` through `--text-hero`
- `--leading-tight`, `--leading-normal`, `--leading-relaxed`
- `--measure-reading`, `--measure-wide`, `--measure-full`
- `--tracking-display`, `--tracking-body`, `--tracking-label`

## Layout tokens

- `--container-max`
- `--container-wide`
- `--gutter`
- `--article-gutter`
- `--section-space`
- `--stack-space`
- `--grid-gap`
- `--header-height`

## Surface and effect tokens

- `--radius-xs` through `--radius-xl`
- `--border-width`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--blur-surface`
- `--gradient-primary`
- `--texture-image`
- `--image-treatment`

## Motion tokens

- `--motion-fast`
- `--motion-base`
- `--motion-slow`
- `--ease-standard`
- `--ease-emphasized`
- `--motion-distance`

Give every theme a reduced-motion override. No animation should remain essential for comprehending content.

---

# Required theme catalogue

Implement all 26 themes below with a coherent token set, preview metadata, and at least key header/post-card/article treatment variants. You do not need 26 completely independent page codebases; use reusable layout families. However, the visual outcomes must be genuinely different.

## Minimal and editorial

### 1. Minimal Editorial

- Quiet neutral paper background, near-black ink, restrained single accent.
- High-quality serif body text with modern sans metadata.
- Narrow reading column and generous whitespace.
- Best for essays, personal thoughts, research, long-form writing.

### 2. Minimal Dark

- Near-black canvas, softened light text, controlled contrast, calm glow-free surfaces.
- Elegant, not developer-terminal-like.
- Best for writers who prefer night reading.

### 3. Swiss Grid

- Strong typographic grid, asymmetric editorial layouts, confident large headings.
- Sans-forward visual language, colored blocks used sparingly.
- Best for design, studio, product, culture, professional posts.

### 4. Soft Journal

- Warm paper tones, soft hand-made atmosphere, gentle separators, rounded accents without childishness.
- Best for diary, personal reflection, lifestyle, family stories.

### 5. Brutalist

- Functional visual harshness: strong outlines, monospace or grotesk type, visible structure, unapologetic contrast.
- Must remain accessible and usable; no intentionally broken interactions.
- Best for experimental creators and designers.

## Technology and future

### 6. Developer Console

- Dark code-focused system UI, structured panels, practical syntax highlighting, terminal-inspired details.
- Best for developers, DevOps, security, IT administration.

### 7. Cyber Neon

- Controlled neon on deep dark surfaces, cyan/magenta/violet glow used at visual anchors only.
- Avoid unreadable text and overanimation.
- Best for cyberpunk, gaming, experimental tech.

### 8. Glass Future

- Layered translucent surfaces, luminous but restrained gradients, atmospheric depth.
- Provide solid-surface fallback for unsupported blur or reduced transparency preferences.
- Best for AI, product, startup, future-facing portfolios.

### 9. Holographic

- Iridescent gradients, spectral highlight, dimensional composition.
- Avoid relying on color shifts to communicate state.
- Best for visual technology, digital art, sci-fi.

### 10. AI Lab

- Precision research-lab aesthetic, data-like dividers, subtle grid/coordinate motifs, analytical hierarchy.
- Best for AI experimentation, research notes, technical writing.

## Lifestyle and storytelling

### 11. Travel Atlas

- Full-bleed destination imagery, warm map colors, location chips, route/timeline compatible blocks.
- Best for travel logs and destination guides.

### 12. Outdoor Expedition

- Rugged typography, terrain-inspired earth palette, utility details, route and gear-compatible blocks.
- Best for hiking, camping, climbing, outdoor projects.

### 13. Food Journal

- Food photography-led, warm restrained palette, editorial recipe teasers, tactile texture optional.
- Best for cooking, restaurant stories, food experiences.

### 14. Recipe Studio

- Recipe-first layout, readable ingredient card system, step hierarchy, prep/cook information treatment.
- Best for repeatable recipe publishing.

### 15. Nature Organic

- Plant-inspired but sophisticated palette, rounded organic forms, calm reading modes.
- Best for ecology, gardening, wellness, outdoor living.

### 16. Family Storybook

- Bright but controlled warmth, highly readable, photo-memory-friendly composition.
- Best for family journals and life stories.

## Creative and portfolio

### 17. Photo Portfolio

- Gallery-led, image-forward, unobtrusive typography, elegant lightbox compatibility.
- Best for photography, visual storytelling, architecture.

### 18. Art Gallery

- Museum-like whitespace, expressive type contrasts, visual focus, project presentation.
- Best for artists, illustrators, designers.

### 19. Music Night

- Rich dark club palette, album/poster composition, rhythm-inspired dividers.
- Best for music, events, record collections, DJ stories.

### 20. Gaming Arena

- Bold confident surfaces, hierarchy for reviews/guides/builds, energetic but not cluttered.
- Best for gaming content and esports-adjacent creators.

### 21. Luxury Fashion

- Editorial contrast, ample whitespace, refined typography, premium imagery behavior.
- Best for fashion, beauty, style, premium product stories.

## Professional and specialist

### 22. Corporate Authority

- High trust, clear hierarchy, controlled blue/neutral palette, crisp data/case-study components.
- Best for consultants, business leaders, B2B writing.

### 23. Industrial Workshop

- Functional material palette, durable grid, equipment/job-story compatibility, safety visual language.
- Best for trades, construction, engineering, fabrication, operations.

### 24. Academic Paper

- Formal reading mode, citations/footnotes support, print-friendly styling, restrained formal palette.
- Best for research, thought leadership, essays.

### 25. Magazine Newsroom

- Dynamic editorial hierarchy, featured stories, content-density modes, category landing pages.
- Best for multi-topic publishing and news-style blogs.

### 26. Retro Eighties

- Synth-inspired color discipline, grid motifs, intentionally nostalgic typography, media-friendly design.
- Best for retro technology, gaming, music, personal nostalgia.

---

# Layout families

Create reusable layout families, then map themes to them.

1. `reading-first`: Minimal Editorial, Minimal Dark, Soft Journal, Academic Paper.
2. `grid-editorial`: Swiss Grid, Magazine Newsroom, Corporate Authority, Industrial Workshop.
3. `immersive-visual`: Travel Atlas, Outdoor Expedition, Food Journal, Photo Portfolio, Art Gallery, Luxury Fashion.
4. `future-interface`: Developer Console, Cyber Neon, Glass Future, Holographic, AI Lab, Gaming Arena, Music Night, Retro Eighties.
5. `friendly-organic`: Recipe Studio, Nature Organic, Family Storybook.
6. `experimental`: Brutalist.

For each layout family, define:

- Homepage composition.
- Article header composition.
- Article reading width rules.
- Card styles.
- Hero behavior.
- Navigation behavior.
- Footer behavior.
- Gallery defaults.
- Mobile adaptations.

---

# Theme preview experience

Build static theme preview data and a Creator Workspace-ready `ThemeGallery` component. It does not need to commit changes yet; it must allow exploration and local preview.

Required features:

- Grid view of theme cards.
- Filter by category, mood, content type, dark/light, and media emphasis.
- Preview card with screenshot/illustration, color swatches, font pair, theme description, suitable use cases, and special features.
- “Preview this style” action that applies only a browser-local temporary theme state.
- Full-page preview route using fixture content.
- Compare mode for up to two themes where practical, no need for complex split-screen state persistence.
- Accessible controls, keyboard operation, visual state beyond color alone.
- Clear distinction between “temporary preview” and “saved site theme.”

All preview artwork must be original procedural gradients, local SVG compositions, or placeholder media created specifically for the project. Do not reuse copyrighted screenshots or brand artwork.

---

# Theme customization boundary

Implement controlled per-instance customization without allowing an unmaintainable free-for-all.

Creators may customize:

- Site identity: name, logo, favicon, social links.
- Chosen theme.
- A small token override allowlist: primary, secondary, accent, body font selection from allowed list, display font selection from allowed list, density, radius preference, logo scale.
- Header layout variation from limited choices.
- Homepage module order and optional modules.
- Default gallery style.
- Default article width.

Creators must not inject arbitrary CSS from the UI in version 1. Explain why this restriction protects upgrades, performance, security, and accessibility.

Create an optional advanced `instance-overrides.css` file for a developer-controlled custom layer, loaded after the theme but constrained by documented semantic selectors. Mark it as an upgrade-risk boundary.

---

# Motion and interaction design

Specify and implement a motion system that works across themes.

- Use opacity and transform for short transitions where possible.
- Avoid continuous GPU-heavy animations.
- Never block navigation or reading with intro animation.
- Respect `prefers-reduced-motion: reduce` globally.
- Provide no-motion equivalents for hover effects, page transitions, parallax, and gallery movement.
- Ensure touch devices retain clear interaction feedback without hover.
- Use subtle page view transitions only if they do not cause accessibility or navigation issues; provide a fallback.

Theme-specific examples:

- Cyber Neon: very subtle glow response on interactive elements; no permanent flashing.
- Travel Atlas: slow reveal for a hero image; no parallax required.
- Swiss Grid: crisp layout transitions only.
- Food Journal: tasteful image scale on hover only.
- Brutalist: immediate hard transitions are valid; still visibly focused.

---

# Accessibility and readability validation

For every theme, ensure:

- Body text reaches WCAG AA contrast requirements.
- Focus ring is visible against all relevant surfaces.
- Link distinction does not rely only on color.
- Text selection remains readable.
- Code blocks are horizontally scrollable and labeled.
- Dark themes do not use pure white-on-pure-black for all long body text unless deliberately tested for comfort.
- Decorative graphic effects have `aria-hidden` or are CSS-only and do not affect reading order.
- Dense visual themes preserve a calm article reading view.
- Print stylesheet falls back to a readable, ink-friendly monochrome document.

Create an automated palette-validation utility or documented test fixture to check representative contrast pairs for each theme.

---

# Output requirements

Return a complete implementation package containing:

1. Theme registry TypeScript code.
2. Shared token CSS and theme contract documentation.
3. All 26 theme token files.
4. At least one layout variant implementation per layout family.
5. Component-variant pattern with examples for header, post card, article header, figure, and footer.
6. ThemeGallery code and fixture data.
7. Local preview state implementation that does not write to the repository.
8. Theme selection configuration shape and validation.
9. Accessibility and reduced-motion CSS.
10. Theme-specific sample homepage/article fixtures.
11. Contrast validation tests or utility.
12. A visual QA checklist for desktop, tablet, and mobile.
13. Documentation on creating a new theme without copying an entire website.

Do not return vague design advice. Supply code, folder paths, interfaces, CSS, and exact integration instructions. Build for a polished premium product whose identity can range from restrained editorial to unapologetically futuristic while keeping content legible and the engine maintainable.
