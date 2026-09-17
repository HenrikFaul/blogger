import { describe, it, expect } from 'vitest';
import { postSchema } from './lib/content-schemas';

// The shared post schema is the single source of truth for content validation.
// It is imported directly (not via the Astro collection loader, whose schema
// is typed as a union with a context function and therefore has no parse/safeParse).

describe('Content Schemas', () => {
  describe('Post Schema', () => {
    it('should validate a correct post', () => {
      const validPost = {
        title: 'Valid Title',
        excerpt: 'This is a valid excerpt.',
        author: 'john-doe',
        publishedAt: new Date(),
        categories: ['tech'],
        tags: ['web'],
        status: 'published',
      };

      const result = postSchema.safeParse(validPost);
      expect(result.success).toBe(true);
    });

    it('should reject a post without categories', () => {
      const invalidPost = {
        title: 'Valid Title',
        excerpt: 'This is a valid excerpt.',
        author: 'john-doe',
        publishedAt: new Date(),
        categories: [], // Min 1 category is required
        status: 'published',
      };

      const result = postSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });

    it('should reject a title that is too long', () => {
      const invalidPost = {
        title: 'a'.repeat(101), // Max 100
        excerpt: 'This is a valid excerpt.',
        author: 'john-doe',
        publishedAt: new Date(),
        categories: ['tech'],
      };

      const result = postSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });
  });
});
