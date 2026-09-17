# Prompt 09 — Security, Privacy, and Operations

## Copy-ready prompt

You are a security engineer, privacy specialist, and site reliability engineer. Build the **Security, Privacy, and Operations** foundation for ForgeBlog, a static-first blog engine running on GitHub + Vercel only.

The goal is to create a trustworthy, resilient publishing platform that protects creators, respects visitor privacy, and remains operationally sound without a traditional backend database.

---

# Security philosophy

ForgeBlog’s security model must be:

- Realistic about the static, Git-backed architecture.
- Honest about what can and cannot be protected without a backend.
- Focused on practical threats: account takeover, content tampering, data loss, and privacy violations.
- Aligned with modern web security best practices.

---

# Threat model

Define and address these threat categories:

## Account and repository access

- Unauthorized access to GitHub account.
- Compromised OAuth tokens or personal access tokens.
- Malicious collaborator with write access.
- Phishing attacks targeting creators.

## Content integrity

- Unauthorized content modification.
- Accidental mass deletion.
- Malicious embed or script injection.
- SEO spam through compromised content.

## Visitor security

- Cross-site scripting (XSS) through user-generated content.
- Malicious redirects or links.
- Insecure third-party embeds.
- Tracking and privacy violations.

## Operational security

- Lost repository access.
- Vercel account compromise.
- DNS hijacking.
- Supply chain attacks through dependencies.

---

# Authentication and authorization

## GitHub OAuth

- Use GitHub OAuth for Creator Workspace authentication.
- Request minimum necessary scopes.
- Never expose tokens in client-side bundles.
- Use secure server-side token exchange where required.
- Implement token refresh and revocation flows.

## Repository permissions

- Document required repository permissions clearly.
- Use branch protection rules for production branches.
- Require pull request reviews for team workflows.
- Limit write access to trusted collaborators.
- Audit repository access regularly.

## Session management

- Use secure, httpOnly cookies for session tokens.
- Implement reasonable session timeouts.
- Provide logout functionality that clears session state.
- Support multiple device sessions with clear visibility.

---

# Content security

## Input validation

- Validate all content at schema level using Zod.
- Reject malformed or dangerous frontmatter values.
- Sanitize rich text output to prevent XSS.
- Validate image file types and sizes.
- Restrict embed URLs to an allow-list.

## Output encoding

- Escape dynamic content appropriately in templates.
- Use Content Security Policy to restrict script execution.
- Avoid inline scripts where possible.
- Sanitize HTML from rich text editors before rendering.

## CSP implementation

Define a Content Security Policy that:

- Allows scripts from self and trusted CDNs only.
- Restricts styles to self and necessary font hosts.
- Limits image sources to self and trusted providers.
- Blocks unsafe inline scripts and eval.
- Uses nonces or hashes for any required inline scripts.

Example policy structure:

```text
default-src 'self';
script-src 'self' 'nonce-<random>' https://trusted-cdn.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://trusted-images.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://api.github.com;
frame-src 'self' https://www.youtube-nocookie.com;
```

Adapt to actual dependencies and document tradeoffs.

---

# Dependency security

## Supply chain hygiene

- Pin all dependencies to specific versions.
- Use lockfiles consistently.
- Review dependency changes before updating.
- Avoid unnecessary dependencies.

## Automated updates

- Use Dependabot or Renovate for security updates.
- Review and test updates before merging.
- Monitor security advisories for critical dependencies.

## Build integrity

- Build from lockfile, not floating versions.
- Verify build outputs where practical.
- Use reproducible builds where feasible.

---

# Privacy philosophy

ForgeBlog must respect visitor privacy by default.

Principles:

- Minimize data collection.
- Avoid unnecessary tracking.
- Be transparent about any analytics.
- Comply with GDPR, CCPA, and similar regulations where applicable.

---

# Analytics and tracking

## Privacy-first approach

- Do not include analytics by default.
- If analytics are enabled, use privacy-respecting options:
  - Plausible, Fathom, or similar privacy-focused services.
  - Self-hosted analytics where practical.
  - Anonymized IP addresses.
  - No cross-site tracking.
  - Clear opt-out mechanisms.

## Disclosure

- Document analytics usage in privacy policy.
- Provide cookie/consent banner where legally required.
- Allow users to opt out easily.

## Third-party embeds

- Lazy-load embeds with click-to-load consent.
- Use privacy-enhanced modes where available (e.g., YouTube-nocookie).
- Document third-party data collection in privacy policy.
- Allow creators to disable specific embed types.

---

# Legal and compliance

## Required pages

Provide templates for:

- Privacy Policy.
- Terms of Service / Terms of Use.
- Imprint / Impressum (where required).
- Cookie Policy (if cookies are used).
- Accessibility Statement (recommended).

## Cookie compliance

- Inventory all cookies and local storage usage.
- Classify cookies as essential, functional, analytics, or marketing.
- Implement consent management where required.
- Respect Do Not Track signals where practical.

## Data retention

- Document how long content and logs are retained.
- Provide data deletion procedures.
- Support data export for creators.

---

# Backup and recovery

## Git-based backup

- Regular Git clones to local or secondary storage.
- GitHub repository export procedures.
- Document recovery from Git history.

## Vercel backup

- Document Vercel deployment history usage.
- Export environment variable configurations.
- Maintain DNS configuration records.

## Media backup

- Ensure all media is committed to Git.
- If using external storage (e.g., Vercel Blob), document backup procedures.
- Test restoration procedures periodically.

## Disaster recovery plan

Create a simple playbook covering:

- Repository loss or corruption.
- Vercel account issues.
- Domain/DNS problems.
- Content deletion or corruption.
- Security incident response.

---

# Monitoring and alerting

## Uptime monitoring

- Use uptime monitoring services for production sites.
- Alert on deployment failures.
- Monitor custom domain SSL certificate expiration.

## Error tracking

- Implement error tracking for Creator Workspace JavaScript errors.
- Monitor build failures in CI/CD.
- Track 404s and broken links where practical.

## Security monitoring

- Monitor GitHub security alerts.
- Track unusual repository activity.
- Watch for dependency security advisories.

---

# Incident response

Define basic incident response procedures:

## Security incident

- Identify scope and impact.
- Revoke compromised credentials.
- Audit recent changes.
- Notify affected parties if required.
- Document lessons learned.

## Content incident

- Identify unauthorized changes.
- Restore from Git history.
- Audit access logs.
- Strengthen access controls if needed.

## Operational incident

- Identify root cause (deployment, DNS, dependency, etc.).
- Restore service using rollback or recovery procedures.
- Communicate status to stakeholders.
- Document and prevent recurrence.

---

# Operational runbooks

Create practical runbooks for:

## Routine operations

- Weekly or monthly dependency updates.
- Monthly security review.
- Quarterly backup verification.
- Annual access audit.

## Common tasks

- Adding a new collaborator.
- Removing a collaborator.
- Rotating tokens or credentials.
- Migrating to a new domain.
- Upgrading the engine version.

## Emergency procedures

- Emergency content takedown.
- Emergency deployment rollback.
- Emergency access revocation.
- Emergency DNS changes.

---

# Output requirements

Return:

1. Threat model documentation with mitigations.
2. Authentication and authorization implementation.
3. Content validation and sanitization code.
4. CSP configuration and documentation.
5. Dependency management policies.
6. Privacy policy and legal page templates.
7. Analytics integration with privacy safeguards.
8. Backup and recovery procedures.
9. Monitoring and alerting setup guidance.
10. Incident response and operational runbooks.

The final system must provide real security and privacy protections appropriate for a static, Git-backed platform, with clear documentation for both technical operators and nontechnical creators.