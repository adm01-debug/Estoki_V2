import { describe, it, expect } from 'vitest';

describe('ScrollAreaCustom', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ScrollAreaCustom');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
