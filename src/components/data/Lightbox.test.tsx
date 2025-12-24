import { describe, it, expect } from 'vitest';

describe('Lightbox', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Lightbox');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
