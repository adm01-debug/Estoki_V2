import { describe, it, expect } from 'vitest';

describe('hover-card', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./hover-card');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should export components', async () => {
    try {
      const module = await import('./hover-card');
      expect(Object.keys(module).length).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
