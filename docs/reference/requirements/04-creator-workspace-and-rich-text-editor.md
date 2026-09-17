# Prompt 04 — Creator Workspace and Rich Text Editor

## Copy-ready prompt

You are a senior frontend engineer specializing in authoring tools, content UX, and rich-text editors. Build the **Creator Workspace** and **block-oriented rich text editor** for ForgeBlog, a static-first blog engine that uses GitHub for content storage and Vercel for deployment.

This workspace is the authenticated environment where a creator writes, edits, organizes, and publishes content that ultimately becomes static Markdown/MDX in the repository. The workspace must feel modern, responsive, and fluid while remaining honest about its persistence model: content becomes durable only after a Git commit or pull request.

Do not implement a backend database. Use browser storage for local drafts and a Git-based CMS or GitHub API for durable commits. Keep public site performance unaffected by this workspace.

---

# Workspace philosophy

The Creator Workspace must be:

- A single-page application or island-style app mounted under `/creator/`.
- Accessible only to authenticated users.
- Optimized for writing, not for public visitor experience.
- Honest about state: local draft, repository draft, preview deployment, production.
- Designed for a single creator or a small team, not a massive multi-tenant SaaS.
- Independent of the public site’s static generation and theme logic.

The workspace must not degrade the public site’s performance or SEO. It is a separate application that shares the repository and configuration.

---

# Authentication and persistence model

Implement a Git-based authentication approach that does not require a traditional backend.

Two viable options:

1. **Decap CMS (formerly Netlify CMS) style**: a React app at `/creator/` that authenticates via GitHub OAuth and commits directly to the repository.
2. **Custom GitHub OAuth flow** with a minimal Vercel serverless function to exchange codes and issue short-lived tokens, then a client-side app that uses those tokens to read/write content files.

For this implementation, adopt the Decap-style pattern but integrate it deeply with the ForgeBlog design system and content model.

Persistence states:

- **Local draft**: stored in browser storage, keyed by content type and slug. Recoverable only on the same browser/device.
- **Repository draft**: a Markdown/MDX file committed to a branch.
- **Preview deployment**: Vercel preview URL built from a branch or pull request.
- **Production**: content on the main branch and deployed to production.

The UI must always show the current state and what action is needed to move to the next state.

---

# Workspace information architecture

Implement these core areas:

## Dashboard

- Summary of content: draft, review, published, recently changed.
- Quick actions: new post, new page, new project.
- Recent activity log.
- Next scheduled tasks or reminders if any.
- Status of last deployment.

## Content library

- Unified list of posts, pages, and projects.
- Filters: type, status, author, category, tag, series.
- Search by title, slug, excerpt, tags.
- Sort by updated, created, published.
- Bulk actions: change status, move to archive, delete with confirmation.
- Visual preview thumbnails where applicable.

## Composer

- Title input with slug preview and edit.
- Block-based editor for the body.
- Right-side inspector for metadata.
- Top bar for save, preview, publish actions.
- Status indicator: local only, saved to branch, published.
- Keyboard shortcuts: save, preview, publish, undo, redo, search.

## Media library

- Grid of uploaded images and assets.
- Upload via drag-and-drop or file picker.
- Metadata: alt text, credit, caption, focus point.
- Usage count or references if practical.
- Filter by type, date, tag.

## Theme explorer

- Visual grid of themes.
- Filter by category, mood, content type.
- Preview mode that applies theme locally in the workspace.
- “Use this theme” action that writes to site configuration and triggers a commit.

## Settings

- Site identity: name, logo, description, social links.
- Navigation configuration.
- SEO defaults.
- Feature flags.
- Danger zone: reset local drafts, clear cache.

---

# Rich text editor requirements

Build a block-oriented editor using a modern headless editor core such as Tiptap or Lexical. Do not use a legacy WYSIWYG that produces noisy HTML.

The editor must support:

## Core text formatting

- Headings H1–H3.
- Paragraph, blockquote, code block.
- Bold, italic, underline, strikethrough, mark.
- Superscript, subscript.
- Ordered and unordered lists.
- Task lists.
- Links with title and target.
- Inline code.
- Horizontal rule.

## Slash command menu

- Triggered by `/`.
- Insert heading, paragraph, quote, code, list, task list, image, gallery, embed, callout, table, divider.
- Keyboard navigable and screen-reader friendly.

## Markdown shortcuts

- `#` for heading.
- `*` or `-` for list.
- `[]` for task.
- `>` for quote.
- `` ` `` for inline code.
- `---` for divider.
- `**text**` for bold, `*text*` for italic.

## Image and media blocks

- Insert image block with upload or URL.
- Caption, credit, alt text, decorative toggle.
- Aspect ratio and width controls.
- Alignment options.
- Click-to-open lightbox in preview.

## Gallery block

- Multiple images in one block.
- Layout options: grid, masonry-like, justified, carousel, stacked.
- Ordering by drag-and-drop.
- Per-image caption and credit.
- Global settings: gap, radius, background, click behavior.

## Embed block

- Allow-list of providers: YouTube, Vimeo, Spotify, SoundCloud, CodePen, GitHub Gist, Figma, Maps where safe.
- Lazy load with click-to-load consent pattern.
- Aspect ratio and size controls.

## Callout block

- Info, success, warning, danger variants.
- Title and body.
- Optional icon.

## Table block

- Add/remove rows and columns.
- Header row and column support.
- Basic cell alignment.
- Keyboard navigation.

## Series and related content helpers

- Insert series navigation block.
- Insert related posts block with manual selection.

## Code and technical content

- Syntax-highlighted code block with language selection.
- Copy button.
- Optional filename.
- Optional collapsible region.

## MDX component insertion

- For advanced users, allow insertion of specific MDX components with controlled props.
- Validate props against a schema.
- Prevent arbitrary JSX execution.

---

# Editor UX details

- Split-screen live preview mode: editor left, preview right.
- Inline WYSIWYG mode: content appears close to final styling.
- Toggle between modes.
- Real-time word count, character count, estimated reading time.
- Outline panel from headings with jump links.
- Undo/redo with a clear history stack.
- Autosave to local storage every few seconds.
- Explicit save to repository action.
- Publish action with confirmation and status explanation.
- Keyboard shortcuts documented in a help panel.

---

# Metadata inspector

Implement a right-side panel for post/page/project metadata.

Fields:

- Title and slug.
- Excerpt.
- Author.
- Status: draft, review, published, archived.
- Published date and time.
- Categories and tags with autocomplete.
- Series selection and order.
- Hero image selection or upload.
- Hero treatment selection.
- SEO title and description.
- Social card image override.
- Canonical URL override.
- Theme or layout override.
- Gallery defaults for this post.
- Location metadata for travel content.
- Recipe metadata for cooking content.
- Project metadata for portfolio content.
- Comments enabled/disabled placeholder for future integration.
- Indexing directives: noindex, nofollow if needed.

Validate all fields and show clear errors. Prevent publishing without required fields.

---

# Media upload and management

Implement a media workflow compatible with static hosting.

Baseline:

- Uploads are committed to the repository under an assets folder.
- File names are normalized and deduplicated.
- Image optimization happens at build time, not during upload.
- File size and type validation occurs before commit.

Optional future:

- Vercel Blob integration with secure upload tokens.
- Clear documentation of costs, backup, and ownership.

Media library features:

- Drag-and-drop upload.
- Progress indicator.
- Retry on failure.
- Alt text and credit editing.
- Decorative toggle.
- Delete with usage warning if practical.

---

# Preview and deployment integration

The workspace must integrate with Vercel preview deployments.

- When a creator saves a draft to a branch, show the Vercel preview URL.
- Provide a “Open preview” button.
- Show last deployment status if available via Vercel API or webhook metadata.
- Explain that production publishing requires merging to the main branch.

Do not implement a full CI/CD UI; keep it simple and honest.

---

# Versioning and restore

Implement a restore workflow that is safe and explicit.

- Show a list of previous commits for a given content file.
- Display commit message, date, author.
- Show a diff summary: lines added/removed.
- Allow restoring a previous version to a new local draft.
- Require explicit save and publish after restore.
- Never silently overwrite current local changes.

Document that Git history is the source of truth for versioning.

---

# Accessibility and keyboard support

- All workspace controls must be keyboard accessible.
- Focus management in dialogs and panels.
- Screen-reader announcements for status changes.
- Clear labels and descriptions.
- High-contrast mode support.
- Reduced motion support.

---

# Security considerations

- GitHub OAuth tokens must be handled securely.
- No secrets in client bundles.
- Validate all user input.
- Sanitize HTML output from the editor.
- Restrict embed URLs to an allow-list.
- Prevent mass deletion without confirmation.

---

# Output requirements

Return:

1. Workspace app structure and routing.
2. Authentication flow code and configuration.
3. Editor core setup with all extensions.
4. Slash command menu implementation.
5. Media upload and library components.
6. Metadata inspector components and validation.
7. Preview and deployment integration code.
8. Version history and restore workflow.
9. Accessibility and security implementation notes.
10. Documentation for creators and developers.

Provide complete, production-quality code. Do not skip complex parts. The workspace must feel premium and trustworthy.