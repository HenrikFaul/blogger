import { describe, it, expect } from 'vitest';
import { InstanceConfigSchema } from '../../config/site.config';

describe('InstanceConfig Schema Validation', () => {
  it('should pass with a valid complete configuration', () => {
    const validConfig = {
      id: "test-instance",
      name: "Test Blog",
      siteUrl: "https://test.com",
      description: "Test description",
      language: "hu",
      timeZone: "Europe/Budapest",
      theme: "minimal-editorial",
      logo: { src: "/logo.svg", alt: "Logo" },
      favicon: "/favicon.svg",
      seo: {
        defaultTitleTemplate: "%s | Test",
        noindexDrafts: true,
      },
      content: {
        postsPerPage: 10,
        showReadingTime: true,
        showLastUpdated: true,
      },
      features: {
        searchEnabled: true,
        newsletterEnabled: false,
        commentsEnabled: false,
        analyticsEnabled: false,
      },
      navigation: { header: [], footer: [] },
      legal: { copyrightHolder: "Test Corp" }
    };

    const result = InstanceConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should fail when siteUrl is missing or invalid', () => {
    const invalidConfig = {
      id: "test",
      name: "Test",
      siteUrl: "not-a-url",
      // ... missing other required fields
    };

    const result = InstanceConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
