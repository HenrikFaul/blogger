# Prompt 05 — Image Gallery and Media System

## Copy-ready prompt

You are a senior frontend engineer specializing in media systems, accessibility, and performance optimization. Build the **Image Gallery and Media System** for ForgeBlog, a static-first blog engine that uses GitHub for content storage and Vercel for deployment.

This system must deliver visually stunning, highly configurable galleries and media experiences while maintaining strict accessibility, performance, and SEO standards. All media must be versioned in Git and optimized at build time for static delivery.

---

# Gallery philosophy and constraints

The gallery system must:

- Work without a backend database or server-side media management.
- Use Git-managed assets as the canonical source.
- Generate responsive, optimized images at build time.
- Provide multiple layout options selectable per gallery instance.
- Support keyboard navigation, screen readers, and reduced motion.
- Maintain excellent Core Web Vitals scores with proper image sizing and lazy loading.
- Allow creators to configure galleries through the Creator Workspace.

---

# Required gallery layouts

Implement these gallery layouts, each with distinct visual behavior and configuration options:

## 1. Editorial Grid

- Uniform aspect ratio tiles in a responsive grid.
- Configurable columns (2–6) and gaps.
- Optional captions below each image.
- Hover state with subtle scale or overlay.
- Click to open lightbox.
- Best for: blog post image sequences, product showcases, portfolio highlights.

## 2. Masonry Balanced

- Pinterest-style vertical layout that balances column heights.
- Preserves original image aspect ratios.
- Configurable column count and gap.
- Captions on hover or below image.
- Smooth entrance animation respecting reduced motion.
- Best for: photography portfolios, travel journals, visual collections.

## 3. Justified Rows

- Google Photos-style justified rows with consistent row height.
- Images fill rows without cropping, varying widths.
- Configurable row height and gap.
- Optional last-row alignment behavior.
- Best for: event coverage, casual photo collections.

## 4. Carousel

- Horizontal scrolling carousel with touch and keyboard support.
- Configurable slides per view, autoplay optional, loop optional.
- Navigation arrows and dot indicators.
- Caption overlay or below carousel.
- Accessible: announce slide changes, trap focus in modal carousel.
- Best for: featured images, step-by-step sequences, before/after comparisons.

## 5. Stacked Story

- Full-width vertically stacked images with parallax optional.
- Text overlays or captions between images.
- Scroll-triggered fade or scale transitions.
- Reduced motion falls back to static stack.
- Best for: visual narratives, travel timelines, project progressions.

## 6. Filmstrip

- Horizontal row of thumbnails with one large featured image above.
- Click thumbnail to change featured image.
- Configurable thumbnail size and count.
- Best for: product photography, detailed visual documentation.

## 7. Comparison Before-After

- Interactive slider comparing two images.
- Drag handle or keyboard control to reveal before/after.
- Labels for each state.
- Accessible: announce percentage, support keyboard increments.
- Best for: renovations, edits, transformations.

## 8. Full-Bleed Chapter Break

- Single full-viewport image as section divider.
- Optional text overlay with high contrast.
- Scroll snap or parallax optional.
- Best for: visual chapter markers, immersive storytelling.

## 9. Lightbox-Only Collection

- Inline thumbnails that open a modal lightbox gallery.
- Lightbox supports all navigation, captions, and keyboard controls.
- Best for: dense image collections where inline space is limited.

## 10. Mixed Media Grid

- Grid that accepts images, videos, and embeds.
- Consistent tile sizing with media-type indicators.
- Video and embed lazy loading with click-to-load.
- Best for: multimedia project documentation.

---

# Gallery configuration schema

Define a strict schema for gallery configuration in frontmatter or MDX props:

```ts
interface GalleryConfig {
  layout: 'editorial-grid' | 'masonry' | 'justified' | 'carousel' | 'stacked' | 'filmstrip' | 'comparison' | 'full-bleed' | 'lightbox' | 'mixed';
  images: GalleryImage[];
  settings: {
    columns?: number;
    gap?: 'none' | 'small' | 'medium' | 'large';
    aspectRatio?: 'auto' | 'square' | 'landscape' | 'portrait' | 'custom';
    customAspectRatio?: string;
    captions?: 'none' | 'hover' | 'always' | 'below';
    clickBehavior?: 'lightbox' | 'none' | 'link';
    linkUrl?: string;
    borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadow?: 'none' | 'small' | 'medium' | 'large';
    background?: 'transparent' | 'surface' | 'muted';
    autoplay?: boolean;
    autoplayInterval?: number;
    loop?: boolean;
    showControls?: boolean;
    showIndicators?: boolean;
    reducedMotionBehavior?: 'static' | 'minimal';
  };
}

interface GalleryImage {
  src: string;
  alt: string;
  decorative?: boolean;
  caption?: string;
  credit?: string;
  width: number;
  height: number;
  focalPoint?: { x: number; y: number };
  linkUrl?: string;
  mediaType?: 'image' | 'video' | 'embed';
  embedUrl?: string;
  comparisonAfterSrc?: string;
}
```

Validate this schema at build time. Provide sensible defaults for all optional settings.

---

# Image optimization pipeline

Implement a build-time image optimization system:

## Source image handling

- Accept images in common formats: JPEG, PNG, WebP, AVIF, GIF.
- Validate file types and maximum file size (configurable, default 10MB).
- Normalize filenames: lowercase, hyphenated, no special characters.
- Deduplicate by content hash if the same image is uploaded multiple times.

## Responsive image generation

- Generate multiple sizes: thumbnail (400px), medium (800px), large (1200px), xlarge (1600px), original.
- Convert to modern formats: WebP and AVIF with fallback to original format.
- Generate srcset attributes for responsive loading.
- Preserve EXIF orientation data.
- Apply focal point cropping if specified.

## Lazy loading strategy

- Use native `loading="lazy"` for below-the-fold images.
- Use `loading="eager"` for above-the-fold LCP candidates.
- Implement intersection observer fallback for browsers without native lazy loading.
- Add blur-up or color placeholder for perceived performance.

## Caching and CDN

- Use content-hashed filenames for cache busting.
- Set appropriate Cache-Control headers via Vercel configuration.
- Leverage Vercel's global CDN for image delivery.

---

# Lightbox implementation

Build a fully accessible lightbox component:

## Features

- Keyboard navigation: arrow keys, home/end, escape to close.
- Touch gestures: swipe to navigate, pinch to zoom if implemented.
- Image counter: "Image 3 of 12".
- Caption and credit display.
- Zoom functionality with pan if image is larger than viewport.
- Share link to specific image if practical.
- Download link with proper attribution.

## Accessibility

- Focus trap when open.
- Return focus to trigger element on close.
- Announce image changes to screen readers.
- Provide text alternatives for all controls.
- Respect reduced motion preferences.

## Performance

- Lazy load images not yet visible in lightbox.
- Preload adjacent images when idle.
- Use optimized thumbnails for initial load.

---

# Media library in Creator Workspace

Build the media management interface:

## Upload workflow

- Drag-and-drop zone with visual feedback.
- File picker with multi-select.
- Progress indicator for each file.
- Retry failed uploads.
- Validate file type and size before upload.

## Metadata editing

- Alt text field with character count guidance.
- Caption and credit fields.
- Decorative toggle.
- Focal point picker with visual preview.
- Bulk edit for multiple images.

## Organization

- Folder or tag-based organization if needed.
- Search by filename, alt text, caption.
- Filter by type, date, usage.
- Usage count showing where an image is referenced.

## Integration with editor

- Insert image block from media library.
- Insert gallery block with multiple selected images.
- Drag images from library into editor.
- Replace image in existing gallery.

---

# Video and embed support

Extend the media system beyond static images:

## Video blocks

- Self-hosted video with multiple formats (MP4, WebM).
- Poster image and captions/subtitles if available.
- Lazy load with click-to-play to save bandwidth.
- Configurable aspect ratio and size.

## Embed blocks

- Allow-list of providers: YouTube, Vimeo, Spotify, SoundCloud, CodePen, Figma, Maps.
- Lazy load with click-to-load consent pattern.
- Configurable aspect ratio and size.
- Privacy-enhanced mode where available (e.g., YouTube-nocookie).

---

# SEO and structured data

Implement comprehensive SEO support:

## Image SEO

- Require meaningful alt text or decorative designation.
- Generate ImageObject JSON-LD for important images.
- Include images in sitemap if they are primary content.
- Use descriptive filenames.

## Gallery SEO

- Provide gallery-level metadata: title, description.
- Generate ImageGallery or Collection schema where appropriate.
- Ensure thumbnails are crawlable and indexed.

## Social sharing

- Generate Open Graph images from hero or gallery images.
- Support Twitter card images from gallery.
- Provide social preview configuration in Creator Workspace.

---

# Performance budgets and monitoring

Define and enforce performance budgets:

- Maximum total image bytes per page: 500KB for text-heavy posts, 2MB for visual stories.
- Maximum images above the fold: 1–2.
- LCP image must be optimized and prioritized.
- Use image CDN analytics if available to monitor real-world performance.

Implement build-time checks:

- Warn if total image size exceeds budget.
- Warn if images lack alt text.
- Warn if images are significantly larger than their display size.

---

# Accessibility compliance

Ensure WCAG 2.2 AA compliance:

- All images have alt text or are marked decorative.
- Galleries are navigable by keyboard.
- Focus is visible and logical.
- Color is not the only means of conveying information.
- Text over images has sufficient contrast.
- Motion can be reduced or disabled.
- Screen readers can understand gallery structure and content.

---

# Output requirements

Return:

1. Gallery component implementations for all 10 layouts.
2. Image optimization pipeline configuration and scripts.
3. Lightbox component with full accessibility support.
4. Media library UI components for Creator Workspace.
5. Video and embed block implementations.
6. SEO and structured data generation code.
7. Performance monitoring and budget enforcement utilities.
8. Accessibility test fixtures and documentation.
9. Creator documentation for using galleries effectively.
10. Developer documentation for adding new gallery layouts.

Provide complete, production-quality code with comprehensive examples. The gallery system must feel premium, performant, and accessible across all themes and content types.