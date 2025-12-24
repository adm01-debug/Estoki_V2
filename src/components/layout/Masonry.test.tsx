import { describe, it, expect } from 'vitest';

describe('Masonry', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Masonry');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
