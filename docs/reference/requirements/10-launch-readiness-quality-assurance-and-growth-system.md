# Prompt 10 — Launch Readiness, Quality Assurance, and Growth System

## Copy-ready prompt

You are the final delivery team for ForgeBlog: a principal product manager, staff frontend engineer, UX quality lead, QA automation architect, technical SEO specialist, accessibility auditor, GitHub/Vercel operations engineer, and conversion-focused content strategist.

ForgeBlog is a premium, static-first, reusable personal blog engine. It must run primarily on GitHub repositories and Vercel deployments, with no conventional database or custom persistent backend. It supports many independent branded sites on real custom domains—not cheap shared subdomains—and provides a visually sophisticated public blog experience plus an authenticated Creator Workspace for writing, reviewing, previewing, and publishing Git-backed content.

This prompt is the final integration, launch-readiness, and long-term quality system. Do not create a shallow checklist. Produce a practical, implementation-grade release package that turns all preceding work into an operable, testable, polished, commercially reusable product.

The final output must be suitable for handing to an AI coding agent and a human operator. It must define exactly what “done” means, how the product is tested, how a new site is launched, how quality regressions are prevented, and how the system can evolve without abandoning its static GitHub + Vercel foundation.

---

# Product recap and immutable constraints

ForgeBlog must provide:

- Static public sites generated from Markdown/MDX and typed configuration.
- GitHub as the canonical content history, revision store, change audit trail, and source repository.
- Vercel for Git-driven builds, preview deployments, production deployment, CDN distribution, HTTPS, custom domains, and deployment history.
- Independent deployments on domains such as `faulhenrik.hu`, `itadminblog.com`, `travelwithanna.com`, and any other valid creator-owned domain.
- A token-based visual engine with many selectable template/theme modes: minimal, editorial, futuristic, developer, travel, cooking, work/office, industrial, artistic, photography, gaming, academic, magazine, and more.
- A Creator Workspace—not “admin panel”—with content drafting, editing, metadata, image and gallery configuration, preview, Git-backed save/publish, revisions, and restore capabilities.
- Browser-local autosave for temporary work, explicitly distinguished from durable Git commits.
- No fake claims of real-time collaboration, scheduled instant publishing, infinite media storage, server-side personalization, or database-like querying when they do not exist.

Do not introduce a conventional backend, database, hosted SaaS CMS, WordPress, Supabase, Firebase, MongoDB, PostgreSQL, Contentful, Sanity, Strapi, or any dependency that invalidates the GitHub + Vercel-only architecture.

If you recommend an optional later integration—newsletter provider, analytics provider, form handling, comments, search service, Vercel Blob, or AI assistance—place it behind a clearly marked optional adapter interface. It must not become required for the product to work.

---

# Final delivery objectives

Create a system that can pass the following real-world scenarios.

## Scenario A — Solo creator launch

A nontechnical but motivated creator can:

1. Copy or create a blog instance from the ForgeBlog template.
2. Change branding, navigation, theme, colors, typography choices, social links, and legal text through documented configuration or Creator Workspace controls.
3. Write an article with headings, rich text, a hero image, a gallery, code or embeds where appropriate, metadata, categories, and SEO data.
4. Save as a draft, open a Vercel preview, verify desktop/mobile presentation, and publish safely.
5. Connect a true custom domain and confirm that HTTPS, sitemap, RSS, canonical URLs, social previews, and redirects are correct.
6. Restore a previously published article revision without understanding raw Git commands.

## Scenario B — Premium vertical site

A travel, food, developer, industrial, artist, or professional site can select a relevant theme and content preset. It must still maintain:

- Clear typography.
- Fast loading.
- Valid semantic HTML.
- Accessibility.
- Search engine crawlability.
- Easy theme replacement without data loss.

## Scenario C — White-label operator fleet

An operator can maintain several independent creator sites with separate content repositories, Vercel projects, custom domains, and branding while distributing engine patches through transparent versioned releases and pull requests.

## Scenario D — Failure recovery

A creator or operator can recover from:

- A bad content publish.
- A broken theme override.
- An accidental content deletion.
- A failed deployment.
- A domain configuration error.
- A dependency update regression.
- A repository-access incident.

Use Git history, pull requests, Vercel preview/production deployment history, documented configuration, and normal rollback commits. Do not rely on undocumented manual magic.

---

# Deliverable structure

Return the complete final package in this exact section order:

1. Release definition and product acceptance criteria.
2. Launch architecture validation.
3. End-to-end user journeys.
4. QA strategy and testing pyramid.
5. Automated test implementation plan.
6. Accessibility certification plan.
7. Performance certification plan.
8. SEO and discoverability certification plan.
9. Cross-browser, responsive, and device QA.
10. Content-quality workflow.
11. Deployment and domain-launch runbook.
12. White-label release and update operations.
13. Monitoring, incident response, and rollback.
14. Documentation package.
15. Future extension architecture.
16. A final “go/no-go” launch checklist.

Use precise tables, example commands, configuration examples, user stories, acceptance tests, test-case IDs, expected results, and failure-mode descriptions. Do not make vague statements like “ensure everything works.” Explain how it is verified.

---

# 1. Release definition

Define release tiers.

## Alpha

Internal engineering quality milestone.

Requirements:

- Core public routes build.
- Content schemas validate.
- At least three visual themes work.
- Creator Workspace can create/edit a basic post and save a Git-backed draft.
- Preview deployment opens.
- No critical security defects.

## Beta

Usable with trusted creators.

Requirements:

- Full major theme catalogue or at least a representative, polished subset with clear expansion path.
- Gallery, image, metadata, revision, preview, publish workflows work.
- Accessibility and performance testing is integrated.
- Documentation supports a new instance deployment.
- Backups and rollback runbooks are tested.

## Version 1.0

Publicly reusable and transferable engine.

Requirements:

- All release-blocker test cases pass.
- Repository template is clean and usable.
- Custom domain deployment validated on at least two independent domains.
- White-label update process validated on at least two instance repositories.
- Public pages meet performance, accessibility, SEO, security, and responsive quality gates.
- No critical or high-severity unresolved defects.
- Documentation is accurate from a cold start.

Create an issue priority model:

| Severity | Meaning | Release impact | Example |
|---|---|---|---|
| Blocker | Core product cannot safely operate | Cannot launch | Production posts cannot publish or render |
| Critical | Security, severe data loss, or widespread breakage | Cannot launch | OAuth token leak or content deletion without recovery |
| High | Major user journey broken with workaround unavailable | Normally blocks launch | Mobile navigation inaccessible |
| Medium | Important quality issue with workaround | Can launch with explicit owner/date | A rare gallery layout misaligns at one breakpoint |
| Low | Cosmetic or enhancement issue | Does not block | Minor spacing inconsistency |

Define concrete release criteria for all severity levels.

---

# 2. Launch architecture validation

Create an architecture verification checklist proving that the implementation obeys the platform boundaries.

## Static content verification

- Published content is represented as Markdown/MDX and typed frontmatter in Git.
- Site configuration is versioned in the repository.
- Public routes are statically rendered during build.
- Draft/review/archived posts are excluded from public listings, RSS, sitemap, JSON search index, and canonical route generation.
- No production public page depends on a private runtime database call.

## GitHub verification

- Branch naming is validated.
- Protected main branch policy is documented.
- GitHub Actions run schema validation, tests, linting, type checking, and production build.
- Pull requests display deploy/validation status.
- Revision and restoration paths are proven through a real test repository.

## Vercel verification

- Import repository workflow is documented.
- Preview deployments appear for pull requests.
- Production deployment follows a configured production branch.
- Environment variable naming and scope are documented.
- Build command, output directory, and framework configuration are correct.
- Deployment error states are human-readable in Creator Workspace and operator documentation.

## No-backend verification

Create a dependency audit that explicitly checks:

- No hidden database SDK is in `package.json`.
- No persistent data is expected from Vercel functions.
- No client-side secret/token leaks exist.
- Local drafts are only presented as temporary browser recovery state.
- Optional external services are disabled by default and implemented only behind adapters.

---

# 3. End-to-end journeys

Write detailed manual and automated acceptance scenarios. Give each a unique ID.

## Public visitor journeys

### E2E-PUB-001: Read a long-form article

- Open article directly from a cold browser session.
- Confirm HTML content is visible before hydration.
- Confirm title, author, date, reading time, hero image, table of contents, body, related content, and footer render correctly.
- Confirm browser back/forward behavior.
- Confirm print stylesheet produces a legible article.

### E2E-PUB-002: Navigate mobile site

- Test at 320px, 375px, 390px, 768px, 1024px, 1440px, and 1920px viewport widths.
- Open and close mobile navigation with keyboard and touch.
- Verify focus management and escape key.
- Verify no horizontal scroll except intentionally horizontal gallery controls.

### E2E-PUB-003: Use search

- Open lazy-loaded search UI.
- Search title, excerpt, category, and tag terms.
- Confirm status announcement and keyboard selection.
- Confirm no results state.
- Confirm search index excludes drafts.

### E2E-PUB-004: Open a gallery

- Open every gallery type.
- Verify image dimensions do not cause layout shifts.
- Open lightbox.
- Navigate with keyboard.
- Close with escape.
- Confirm focus returns to initiating thumbnail.
- Confirm captions/credits are readable.
- Confirm reduced-motion behavior.

### E2E-PUB-005: Theme resilience

- Render representative posts in every theme.
- Confirm headings, body copy, buttons, cards, code blocks, figures, callouts, tables, navigation, and footer use semantic theme tokens.
- Confirm themes do not break content hierarchy.

## Creator journeys

### E2E-CRE-001: Create an article from scratch

- Authenticate.
- Open Creator Workspace.
- Create post.
- Write text using headings, bold text, quote, table, task list, code block, and callout.
- Add hero image and gallery.
- Set author/category/tags/status/SEO fields.
- Autosave locally.
- Save as repository draft.
- Validate generated content file has correct frontmatter and Markdown/MDX.

### E2E-CRE-002: Preview and publish

- Start from repository draft.
- Create review branch and preview deployment.
- Open preview and compare with production.
- Correct content.
- Request review or fast-publish if explicitly enabled.
- Merge/publish to main.
- Confirm production URL, sitemap, RSS, canonical, and social metadata update after deployment.

### E2E-CRE-003: Recover unsaved draft

- Edit a post.
- Simulate browser refresh/close.
- Return to same browser.
- Confirm local draft recovery prompt.
- Confirm the UI states that cross-device recovery requires Git save.

### E2E-CRE-004: Restore revision

- Choose a prior Git revision.
- Read commit metadata and diff.
- Restore into a new local draft.
- Save to a branch.
- Preview.
- Publish through normal process.
- Confirm history is preserved rather than rewritten.

### E2E-CRE-005: Change site theme

- Open Theme Gallery.
- Filter themes.
- Temporarily preview a theme locally.
- Confirm no production style changes happen during temporary preview.
- Select a theme and write intended configuration change to Git.
- Open Vercel preview.
- Confirm all representative pages render in selected theme.
- Publish after review.

## Operator journeys

### E2E-OPS-001: Launch a new white-label instance

- Start from template repository.
- Create instance repository.
- Add site config, logo, theme selection, initial content.
- Import to Vercel.
- Set variables.
- Connect custom domain.
- Validate DNS, HTTPS, redirects, SEO base URL, RSS, and sitemap.

### E2E-OPS-002: Distribute engine patch

- Tag engine patch release.
- Run update-sync workflow against a downstream instance.
- Create update pull request.
- Confirm instance content/configuration remains untouched.
- Test preview.
- Merge.
- Confirm release marker updates.

### E2E-OPS-003: Roll back production

- Simulate bad production commit.
- Identify last known-good commit/deployment.
- Use a revert commit or documented deployment rollback.
- Confirm visitor sees restored version.
- Confirm content history remains auditable.

---

# 4. QA strategy and test pyramid

Create a testing pyramid with responsibilities, tooling, minimum coverage expectation, and execution frequency.

| Layer | Purpose | Examples | Run when |
|---|---|---|---|
| Static analysis | Catch structural defects early | TypeScript, ESLint, Prettier, schema validation | Every local change and CI |
| Unit tests | Verify deterministic business/util logic | slugger, URL resolver, metadata resolver, schemas, gallery config defaults | Local and CI |
| Component tests | Verify isolated UI behavior | cards, dialogs, search, gallery controls, form error messaging | PR CI |
| Integration tests | Verify module boundaries | content loader + routes, Creator save flow + Git adapter | PR CI |
| E2E tests | Verify essential real user journeys | draft → preview → publish, menu, galleries, restore | PR CI / nightly |
| Visual regression | Detect unintended layout change | theme/page screenshot matrix | Nightly and release candidate |
| Manual exploratory QA | Discover nuanced visual/workflow problems | device testing, theme personality assessment | Every release candidate |

Define realistic test coverage priorities. Do not require arbitrary 100% line coverage. Prioritize high-risk logic: publishing state machine, content schema, URL generation, sanitization, authorization boundary, theme registry, image metadata, and rollback behavior.

---

# 5. Automated testing implementation plan

Implement full code/configuration examples for the following.

## Type checking and linting

- Strict TypeScript config.
- ESLint with Astro, TypeScript, accessibility, import/order, and security-related reasonable rules.
- Prettier formatting.
- A command suite:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:component
npm run test:e2e
npm run test:a11y
npm run build
npm run verify
```

`npm run verify` must compose the appropriate checks.

## Unit tests

Provide Vitest tests for:

- Slug normalization.
- Reserved path rejection.
- Date handling and scheduled-post behavior.
- Published post validation.
- Accessible image metadata validation.
- Canonical URL resolver.
- Metadata fallback order.
- JSON-LD generation.
- Theme registry validation.
- Gallery configuration defaults.
- Instance configuration validation.

## Component tests

Use a suitable approach for Astro/React islands. Test:

- Accessible mobile menu.
- Search dialog keyboard sequence.
- ThemeGallery filter and temporary preview.
- Gallery lightbox focus trap and close behavior.
- Code copy control feedback.
- Creator metadata inspector validation errors.
- Publishing confirmation dialog.

## End-to-end tests

Use Playwright.

Provide representative test files for:

- Public content discoverability and navigation.
- Search.
- Lightbox keyboard navigation.
- Responsive header behavior.
- Creator draft recovery using browser storage fixture/mock.
- Git adapter integration mock for save branch / pull request creation.
- Theme preview versus saved theme behavior.

Do not run destructive production publish flows against a real production repository in CI. Use a disposable test repository, mock adapter, sandbox branch, or clearly isolated integration environment.

## Visual regression tests

Create a visual test matrix that includes:

- All theme layout families.
- Homepage.
- Article with hero, code block, table, callout, gallery, long title, long URL, and related posts.
- Listing page.
- Creator composer.
- Desktop, tablet, phone dimensions.
- Light and dark modes where applicable.

Define a policy for approving intentional snapshot changes.

---

# 6. Accessibility certification plan

Target WCAG 2.2 AA. Create an accessibility validation system combining automated and manual checks.

## Automated checks

- axe-core or equivalent during component/E2E tests.
- HTML validation where practical.
- Color-contrast token tests against approved background/text pairs.
- Lint rules that flag common a11y defects.

## Manual checks

- Keyboard-only walkthrough: tab order, skip link, visible focus, menus, search, theme selector, gallery, dialog, composer controls.
- Screen reader spot checks with at least one desktop screen reader/browser combination and one mobile screen reader scenario.
- Zoom to 200% and 400%: no loss of content/functionality and no unacceptable horizontal scrolling for normal text.
- High-contrast / forced-colors check where supported.
- Reduced motion check.
- Touch target review.
- Language declaration and Hungarian diacritic readability check.

## Accessibility acceptance matrix

| Area | Required verification | Pass condition |
|---|---|---|
| Navigation | Keyboard + screen reader | All links/menu controls operable and announced |
| Articles | Semantic outline | One H1, logical headings, landmark structure |
| Images | Schema + manual | Informative images have appropriate alt; decorative images suppressed |
| Gallery | Keyboard/lightbox | Full operation without pointer; focus returns correctly |
| Creator Workspace | Form behavior | Labels, errors, dialogs, dynamic status announcements work |
| Themes | Contrast | Token pairs meet AA targets |
| Motion | Preference honoring | Reduced motion disables nonessential effects |

Include remediation rules: a release cannot pass with a critical keyboard trap, missing main content access, unusable contrast in default content, or inaccessible publishing confirmation.

---

# 7. Performance certification plan

Use field and lab performance together. Do not claim a permanent 100/100 Lighthouse score because scores vary by device, network, content, and third-party services.

## Lab profiles

Test representative routes under:

- Desktop broadband.
- Mid-tier mobile CPU with simulated 4G.
- Slow 4G / constrained connection.
- No-JavaScript baseline.

## Required route matrix

- Homepage with featured media.
- Text-heavy article.
- Gallery-heavy visual story.
- Technical article with code.
- Recipe article.
- Search open state.
- Creator Workspace separately, with a less strict public payload budget but usable responsiveness.

## Performance budgets

Define measurable budgets based on the foundation prompt, then enforce warning/fail tiers.

| Metric | Text article target | Visual article target | Fail threshold |
|---|---:|---:|---:|
| LCP | ≤2.0s | ≤2.5s | >3.0s |
| CLS | ≤0.05 | ≤0.05 | >0.1 |
| INP | ≤150ms | ≤200ms | >300ms |
| Public JavaScript | ≤50KB gzip | ≤100KB gzip | >150KB gzip without approved reason |
| LCP image | ≤150KB | ≤250KB | >400KB |
| Total media | ≤500KB | ≤2MB | >3MB without visual-story override |

## Enforcement

- Implement Lighthouse CI or equivalent for pull requests.
- Implement a build-time image budget report.
- Fail CI for major budget regressions unless an explicit reviewed exception exists.
- Record baseline results in version control.
- Review all new client-side dependencies for bundle impact.

## Optimization remediation guide

Specify exact actions for common failures:

- LCP slow: improve hero sizing, preload correct image, reduce image bytes, remove render-blocking font/CSS.
- CLS high: reserve dimensions, avoid late inserts, stabilize font metrics.
- INP slow: reduce hydrated code, split islands, defer nonessential work.
- JS high: remove dependency, dynamic import island, replace with native HTML/CSS.

---

# 8. SEO and discoverability certification plan

Create an SEO launch process that is concrete, repeatable, and appropriate for independent custom domains.

## Technical SEO tests

For every public content route validate:

- HTTP success status.
- Unique title.
- Meta description.
- Canonical URL matches domain and route.
- Open Graph title, description, URL, and image.
- Social card dimensions/availability when image is configured.
- Correct `lang` and alternate-language links if multilingual support is enabled.
- JSON-LD parses as valid JSON and represents the right schema type.
- No draft/review page exists in sitemap/RSS/search index.
- Internal links do not 404.
- Images include meaningful alt or decorative intent.

## Indexing launch checklist

- Confirm production domain resolves over HTTPS.
- Confirm preferred host redirect (`www` or apex).
- Confirm robots.txt allows intended crawling.
- Confirm sitemap is reachable and contains canonical production URLs.
- Add property to Google Search Console and other desired webmaster tools manually.
- Submit sitemap where appropriate.
- Test key URLs in URL inspection tools after deployment.

## Content quality guardrails

Provide creator guidance and validation warnings for:

- Duplicate titles.
- Empty excerpt/description.
- Excessively long title and description.
- Missing hero/social image.
- Extremely short articles where a longer article is expected—but never block publishing just based on word count.
- Missing internal links on long posts.
- Missing category/tag where content taxonomy requires it.

## Structured data policy

- Use schemas only when content actually qualifies.
- Do not generate fake reviews, ratings, FAQ schema, or recipe metadata.
- Keep dateModified accurate after meaningful edit.
- Validate Recipe schema only when required recipe fields are present.

---

# 9. Cross-browser, responsive, and device QA

Create a compatibility matrix.

Minimum supported browsers:

- Current Chrome/Chromium desktop and Android.
- Current Firefox desktop.
- Current Safari macOS and iOS.
- Current Microsoft Edge.

Define graceful degradation for:

- `backdrop-filter` / glass effects.
- View transitions.
- AVIF images.
- `:has()` selectors if used.
- native dialog support if used.
- container queries.
- Web Share API.

Test viewport and interaction contexts:

- Small phone portrait: 320px–375px.
- Modern phone: 390px–430px.
- Phone landscape.
- Tablet portrait/landscape.
- Small laptop.
- Large desktop.
- Keyboard-only desktop.
- Touch-only mobile.
- Zoomed browser.
- Slow network.
- JavaScript disabled public route.

For every theme family, verify:

- No accidental overflow.
- Readable font scaling.
- No touch target smaller than intended accessible size.
- Navigation remains understandable.
- Tables have a responsive strategy.
- Code blocks scroll appropriately.
- Galleries retain meaning and control accessibility.
- Visual effects degrade safely.

---

# 10. Content-quality workflow

Create a creator-facing editorial quality process without turning the product into an artificial content generator.

## Pre-publish content checklist

- Does the title communicate the article’s purpose?
- Is excerpt/summary useful and distinct?
- Does the opening explain why the article matters?
- Are headings structured logically?
- Do images have useful alt text, captions, and credits where needed?
- Is the selected theme/layout suited to the content?
- Do gallery layout and crop choices support the narrative?
- Are links tested and descriptive?
- Are code blocks complete, syntax selected, and copyable?
- Are factual claims sourced or expressed appropriately?
- Is the author/date/category/tag metadata correct?
- Is SEO/social metadata intentionally set or correctly inherited?

## Creator Workspace quality warnings

Implement nonblocking warnings for:

- Missing excerpt.
- Missing meta description.
- Missing hero alt text.
- Duplicate slug.
- Missing title.
- Broken internal link.
- Gallery image missing alt/credit if required by instance policy.
- Very large image.
- Missing category on a taxonomy-driven blog.
- Theme readability concern caused by an unsafe custom override.

Publishing must be blocked only for genuine correctness/accessibility/security constraints defined in the content schema, not subjective stylistic preferences.

---

# 11. Deployment and domain-launch runbook

Write a zero-assumption step-by-step launch runbook for an operator deploying a new real custom domain.

## Repository preparation

1. Create an instance repository from the ForgeBlog template.
2. Rename repository appropriately.
3. Configure `site.config.ts`, navigation, theme, legal pages, brand assets, and initial content.
4. Run local validation.
5. Commit and push.

## Vercel setup

1. Import repository into Vercel.
2. Confirm framework/build settings.
3. Configure production branch.
4. Add public environment variables such as `PUBLIC_SITE_URL`.
5. Configure any secret values only if optional integrations are enabled.
6. Trigger initial deployment.
7. Review generated Vercel deployment URL before DNS cutover.

## DNS setup

1. Decide preferred canonical host (`example.com` or `www.example.com`).
2. Add the domain in Vercel.
3. Follow exact registrar DNS record instructions supplied by Vercel.
4. Do not hardcode provider IP values in generic documentation; Vercel may present current values per domain/project.
5. Wait for verification and certificate provisioning.
6. Verify HTTPS and redirect behavior.

## Post-launch verification

- Homepage and article route return expected HTML.
- Production canonical URL is correct.
- `robots.txt`, sitemap, RSS work.
- Open Graph preview is valid.
- Mobile navigation works.
- Contact/legal pages are complete.
- Search index does not expose drafts.
- Lighthouse/accessibility smoke checks pass.
- GitHub branch protections enabled.
- Backup and rollback instructions stored where operator can access them.

Vercel’s Git integration automatically creates preview deployments for changes/pull requests and production deployments for the configured production branch; use those previews as mandatory review checkpoints before DNS-facing production changes. [web:61][web:63]

---

# 12. White-label release and update operations

Create a release-engineering workflow for a central ForgeBlog engine repository and separate instance repositories.

## Release process

1. Create feature branch in engine.
2. Run complete CI and test matrix.
3. Produce a preview documentation/demo instance.
4. Update changelog.
5. Classify release as patch, minor, or major.
6. Tag release using semantic versioning.
7. Publish release notes with migration guide if needed.
8. Trigger downstream update pull requests only for instances eligible for that release channel.

## Protected instance zones

A centralized update tool must never overwrite without review:

- Content directories.
- `site.config.ts` or instance configuration.
- Brand assets.
- Domain-specific files.
- Legal content.
- Explicitly marked instance custom components.
- Instance override CSS.

## Upgrade contract

Each instance must have an `engine-version.json` or equivalent that records:

- Engine version.
- Template generation date.
- Enabled optional modules.
- Instance customizations.
- Last successful upgrade.

## Migration process

For a major engine change:

- Provide migration script or precise manual steps.
- Produce upgrade PR, never force-update production.
- Run content schema migrations as previewable, reversible file changes.
- Test preview deployment before merge.
- Keep rollback tag or branch.

---

# 13. Monitoring, incident response, and rollback

Build an operational dashboard/documentation approach based on available GitHub and Vercel signals, without inventing a custom database.

## Minimum health signals

- Last deployment status.
- Latest successful production deployment time.
- Last preview deployment status.
- CI build status.
- Broken-link test status.
- Dependency security alerts.
- Uptime monitor status, if configured.

## Incident severity

| Incident | Severity | Immediate action |
|---|---|---|
| Production unavailable | Critical | Check Vercel status/project deployment, rollback/redeploy known good version |
| Unauthorized content change | Critical | Revoke access/token, inspect Git history, revert, review permissions |
| Broken article route after publish | High | Revert affected content or fix via hotfix branch and preview |
| SEO metadata incorrect | Medium | Fix configuration/content, deploy, request re-crawl if needed |
| Theme visual defect | Medium/Low | Fix via preview PR; roll back if readability/accessibility affected |
| Missing local draft | Medium | Explain browser-storage limits; recover from Git commit if any |

## Rollback rules

- Prefer a standard Git revert commit for production changes.
- Avoid rewriting shared branch history or force pushes.
- Vercel rollback/redeploy may be used for immediate mitigation, but reconcile Git afterward so source and production match.
- Record incident, impact, remediation, and follow-up action.

Create incident templates for GitHub Issues and a short status-message template for creators or clients.

---

# 14. Documentation package

Create a complete documentation set in Markdown.

Required files:

```text
docs/
├── getting-started.md
├── local-development.md
├── creator-workspace.md
├── writing-and-formatting.md
├── media-and-galleries.md
├── themes-and-branding.md
├── publishing-and-previews.md
├── revisions-and-recovery.md
├── custom-domain-launch.md
├── seo-and-discoverability.md
├── accessibility-for-creators.md
├── performance-guide.md
├── security-and-privacy.md
├── backups-and-operations.md
├── white-label-fleet-operations.md
├── upgrade-guide.md
├── troubleshooting.md
└── architecture-decisions.md
```

For each document, provide purpose, intended audience, prerequisite knowledge, and full outline. Write complete starter content for at least:

- `getting-started.md`
- `creator-workspace.md`
- `publishing-and-previews.md`
- `custom-domain-launch.md`
- `revisions-and-recovery.md`
- `troubleshooting.md`

Troubleshooting must cover:

- Build failed due to invalid content schema.
- Image missing or oversized.
- Theme not found.
- Page returns 404.
- Preview deployment not visible.
- Custom domain pending verification.
- HTTPS/certificate issue.
- Canonical URL wrong after domain change.
- Local draft not recovered.
- Publish blocked by metadata validation.
- GitHub authorization denied.
- Update sync conflict.

---

# 15. Future extension architecture

Define extension points without contaminating the version-1 static core.

## Optional adapters

Design interfaces for:

- Newsletter signup provider.
- Privacy-first analytics provider.
- Comment provider.
- External search provider.
- Form handling provider.
- Vercel Blob or equivalent media adapter.
- AI writing assistance adapter.
- Translation/localization workflow adapter.
- E-commerce/affiliate disclosure adapter.

Rules:

- Disabled by default.
- No adapter changes core content portability.
- No adapter leaks keys into client bundles.
- Public site must retain a graceful static fallback where possible.
- Each adapter has privacy, cost, security, and failure-mode documentation.

## Architecture decision records

Create ADR templates and require an ADR for any new dependency that:

- Adds runtime client JavaScript over a defined threshold.
- Adds user data processing.
- Requires a secret.
- Changes the canonical content representation.
- Adds a remote service dependency to public rendering.

---

# 16. Final go/no-go checklist

Produce a comprehensive signed-release checklist with checkboxes, owner column, date column, evidence link column, and status.

It must include at least the following groups.

## Product

- [ ] Core public routes and content types work.
- [ ] Creator Workspace draft/edit/save/preview/publish workflows work.
- [ ] Version restore is proven.
- [ ] Every selected production theme passes representative content tests.
- [ ] Theme switching does not destroy content.
- [ ] Gallery layouts meet interaction and readability requirements.

## Code quality

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Formatting check passes.
- [ ] Unit/component/integration/E2E suites pass.
- [ ] Production build passes from clean clone.
- [ ] No unreconciled dependency security alerts of critical/high severity.

## Accessibility

- [ ] Automated axe checks pass for representative routes.
- [ ] Keyboard walkthrough passes.
- [ ] Screen reader spot check passes.
- [ ] Theme contrast matrix passes.
- [ ] Reduced-motion behavior passes.
- [ ] 200% and 400% zoom checks pass.

## Performance

- [ ] Public performance budgets pass for homepage, text article, and gallery-heavy article.
- [ ] No unnecessary public SPA hydration.
- [ ] LCP image and CLS validations pass.
- [ ] Font/image budget report reviewed.

## SEO

- [ ] Metadata/canonical/schema tests pass.
- [ ] Sitemap/RSS/robots available.
- [ ] Drafts excluded from indexable outputs.
- [ ] Social card previews checked.
- [ ] Production domain is configured correctly.

## Security and operations

- [ ] Branch protections enabled.
- [ ] OAuth/token/secrets review complete.
- [ ] CSP tested against required features.
- [ ] Backup and recovery test completed.
- [ ] Rollback rehearsal completed.
- [ ] Incident contacts/runbooks available.

## Deployment

- [ ] Vercel preview workflow verified.
- [ ] Production deployment verified.
- [ ] Custom domain, redirect, and HTTPS verified.
- [ ] Environment variable scopes reviewed.
- [ ] Fresh clone → local build → Vercel deploy documentation followed successfully by someone not involved in implementation.

## White-label operations

- [ ] At least two instance repositories tested.
- [ ] Protected instance zones preserved during engine update.
- [ ] Update pull request and migration process tested.
- [ ] Engine version recorded per instance.

---

# Final output instructions

Return a complete, executable implementation package rather than a conceptual summary. Include:

1. Full GitHub Actions workflows for CI, content validation, optional scheduled publishing, release checks, and downstream update PR creation.
2. Full Playwright, Vitest, and accessibility test examples.
3. Scripts in `package.json` and supporting utilities.
4. Performance budget/report implementation.
5. SEO validator implementation.
6. The end-to-end test-case catalog.
7. The complete go/no-go checklist template.
8. Runbook and documentation starter files.
9. White-label release/update workflow.
10. Incident templates and rollback scripts/documentation.

Write production-quality code and documentation. Clearly label items that require manual configuration in GitHub, Vercel, a domain registrar, a browser, Search Console, or a third-party optional provider. Never hide an operational requirement behind vague wording.

The outcome must be a genuinely premium, reusable personal blogging product: beautiful enough to feel custom-designed, technically disciplined enough to survive real-world updates, fast and accessible enough to respect visitors, and operationally simple enough to run through GitHub and Vercel without a conventional backend.