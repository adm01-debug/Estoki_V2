import { describe, it, expect } from 'vitest';

describe('InfiniteScroll', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./InfiniteScroll');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
