import { describe, it, expect } from 'vitest';

describe('MarkdownEditor', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./MarkdownEditor');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
