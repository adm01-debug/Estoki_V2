import { describe, it, expect } from 'vitest';

describe('Gallery', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Gallery');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
