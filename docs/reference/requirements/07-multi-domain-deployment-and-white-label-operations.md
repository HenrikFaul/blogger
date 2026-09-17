# Prompt 07 — Multi-Domain Deployment and White-Label Operations

## Copy-ready prompt

You are a platform engineer, DevOps specialist, and SaaS architect. Build the **Multi-Domain Deployment and White-Label Operations** system for ForgeBlog, a static blog engine that must power many independent sites on real custom domains such as `faulhenrik.hu`, `itadminblog.com`, `travelwithanna.com`, or `chefmate.hu`.

The constraint is strict: GitHub + Vercel only, no traditional backend database. Each site must feel like a unique, handcrafted product while sharing the same engine.

---

# Deployment models

Design and implement three deployment models, each with explicit tradeoffs.

## Model A — Single-site starter

**Use case:** One creator, one site, one domain.

**Structure:**

- One GitHub repository containing the full engine and that site’s content and configuration.
- One Vercel project linked to that repository.
- One custom domain attached to the Vercel project.

**Pros:**

- Simplest mental model.
- Fastest to bootstrap.
- No multi-tenant complexity.

**Cons:**

- Engine updates require manual merges or template reapplication.
- No built-in fleet management.

**Implementation:**

- Use a template repository that creators fork or copy.
- Provide clear upgrade documentation.
- Keep instance-specific configuration in well-defined folders.

## Model B — Monorepo fleet

**Use case:** One operator managing many sites, willing to accept a single repository for all instances.

**Structure:**

- One GitHub repository with multiple instance configurations.
- One or more Vercel projects, each configured with environment variables selecting the instance.
- Each instance has its own custom domain.

**Pros:**

- Centralized engine updates.
- Single source of truth.
- Easy to share components and content types.

**Cons:**

- Repository can grow large.
- Mistakes can affect multiple sites.
- Requires careful environment variable management.

**Implementation:**

- Instance config at `src/instances/<instance-id>/site.config.ts`.
- Environment variable `PUBLIC_INSTANCE_ID` selects the instance at build time.
- Vercel project per instance with different environment variables and domains.
- Shared engine code in `src/engine/` or root `src/`.

## Model C — Template repository fleet

**Use case:** Many independent creators, each with their own repository and domain, using the same engine.

**Structure:**

- One canonical engine repository.
- Many instance repositories created from the engine template.
- Each instance repository has its own Vercel project and domain.

**Pros:**

- Strong isolation between instances.
- Each instance can evolve independently.
- Engine updates can be distributed via template sync or Git-based update workflows.

**Cons:**

- More complex update mechanism.
- Potential for divergence.
- Requires disciplined versioning and changelog practices.

**Implementation:**

- Use GitHub template repository feature.
- Provide a sync script or GitHub Action that:
  - Fetches engine updates.
  - Merges them into instance repositories.
  - Creates pull requests for review.
- Keep instance-specific content and configuration in clearly separated folders.

---

# Custom domain configuration

Implement domain handling that works cleanly across all models.

## Vercel domain setup

For each site:

- Add apex domain (e.g., `faulhenrik.hu`) and `www` subdomain to Vercel project.
- Configure DNS records at the registrar:
  - A record for apex to Vercel’s IP.
  - CNAME for `www` to `cname.vercel-dns.com` or equivalent.
- Enforce HTTPS.
- Choose canonical hostname (with or without `www`) and redirect the other.

## Canonical URL strategy

- Define `PUBLIC_SITE_URL` per instance in environment variables.
- Use this value for:
  - Canonical tags.
  - Open Graph URLs.
  - Sitemap entries.
  - JSON-LD identifiers.
- Never hardcode a domain in templates.

## Preview and staging domains

- Use Vercel’s automatic preview URLs for pull requests.
- Optionally attach a staging subdomain to a staging branch or environment.
- Document that preview URLs are for review, not for permanent linking.

---

# Instance configuration model

Define a typed instance configuration that captures all site-specific settings.

```ts
interface InstanceConfig {
  id: string;
  name: string;
  legalName?: string;
  siteUrl: string;
  description: string;
  language: string;
  timeZone: string;
  theme: ThemeKey;
  logo: {
    src: string;
    alt: string;
  };
  favicon: string;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  contact: {
    email?: string;
    imprintUrl?: string;
    privacyUrl?: string;
    termsUrl?: string;
  };
  seo: {
    defaultTitleTemplate: string;
    defaultDescription?: string;
    defaultOgImage?: string;
    noindexDrafts: boolean;
  };
  content: {
    postsPerPage: number;
    showReadingTime: boolean;
    showLastUpdated: boolean;
    defaultAuthor?: string;
  };
  features: {
    searchEnabled: boolean;
    newsletterEnabled: boolean;
    commentsEnabled: boolean;
    analyticsEnabled: boolean;
  };
  navigation: {
    header: NavItem[];
    footer: NavItem[];
  };
  legal: {
    copyrightHolder: string;
    copyrightYearStart?: number;
  };
}
```

Validate this configuration at build time. Provide sensible defaults and clear error messages for missing required fields.

---

# Engine vs instance separation

Define clear boundaries between reusable engine code and instance-specific content.

## Engine code (shared)

- Core layouts and components.
- Theme system.
- Content schemas.
- Build configuration.
- Utility libraries.
- Documentation templates.

## Instance content (unique per site)

- Posts, pages, projects.
- Authors, categories, tags.
- Media assets.
- Site configuration.
- Navigation configuration.
- Legal pages.

## Instance overrides (advanced)

- Optional custom components.
- Optional CSS overrides.
- Optional theme token adjustments.

Document that instance overrides increase upgrade friction and should be used sparingly.

---

# Update distribution strategy

Design a safe update mechanism for Model C (template fleet).

## Versioned releases

- Tag engine releases with semantic versioning.
- Maintain a changelog per release.
- Classify changes as:
  - Patch: safe to auto-merge.
  - Minor: review recommended.
  - Major: manual review required, possible breaking changes.

## Sync workflow

Implement a GitHub Action or script that:

- Clones the engine repository.
- Identifies changed files that are safe to propagate.
- Applies changes to the instance repository.
- Skips files in protected instance folders.
- Creates a pull request with a clear description.
- Runs CI checks on the PR.

## Conflict handling

- Detect conflicts between engine updates and instance customizations.
- Surface conflicts in the pull request.
- Provide guidance for manual resolution.
- Never force-push over instance content.

---

# Environment variable management

Define environment variables per instance:

- `PUBLIC_INSTANCE_ID`
- `PUBLIC_SITE_URL`
- `GITHUB_TOKEN` (if needed for content operations)
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (for advanced CI/CD)
- `ANALYTICS_ID` (optional)
- `NEWSLETTER_ENDPOINT` (optional)

Document:

- Which variables are required.
- Which are optional.
- Which must be kept secret.
- How to set them in Vercel dashboard.
- How to scope them to preview vs production environments.

---

# Multi-domain SEO considerations

Address SEO complexities for multi-domain fleets:

- Ensure each instance has unique content where practical.
- Avoid duplicate content across instances unless intentional.
- Use correct canonical URLs per instance.
- Generate separate sitemaps and RSS feeds per instance.
- Configure separate Search Console properties per domain.
- Use instance-specific Open Graph images where feasible.

---

# Operational documentation

Create operational runbooks for:

## Adding a new instance

- Fork or create from template.
- Configure instance config file.
- Set environment variables in Vercel.
- Attach custom domain.
- Verify DNS and HTTPS.
- Deploy initial content.
- Validate SEO metadata.

## Updating the engine

- Review changelog.
- Run sync workflow or merge engine updates.
- Resolve conflicts.
- Run tests and build locally.
- Deploy to preview.
- Validate visually and functionally.
- Merge to production branch.

## Rolling back an instance

- Identify last known-good deployment.
- Revert Git to that commit or redeploy that version.
- Verify canonical URLs and sitemap.
- Communicate rollback reason if team-based.

## Migrating an instance

- Moving from Model A to Model B or C.
- Exporting content and configuration.
- Importing into new structure.
- Preserving URLs and SEO equity.

---

# Output requirements

Return:

1. Instance configuration schema and validation code.
2. Multi-instance folder structure examples for all three models.
3. Vercel project configuration guidance per model.
4. Custom domain setup documentation.
5. Environment variable templates.
6. Engine/instance separation guidelines.
7. Update sync workflow code or script.
8. Versioning and changelog conventions.
9. SEO checklist for multi-domain fleets.
10. Operational runbooks for common scenarios.

The final system must make it straightforward to launch and maintain many independent, professionally branded blogs on real custom domains while sharing a single, well-maintained engine.