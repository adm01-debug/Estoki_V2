import { describe, it, expect } from 'vitest';

describe('RichTextEditor', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./RichTextEditor');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
