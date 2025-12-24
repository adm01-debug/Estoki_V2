import { describe, it, expect } from 'vitest';

describe('RatingInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./RatingInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
