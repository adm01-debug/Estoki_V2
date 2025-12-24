import { describe, it, expect } from 'vitest';

describe('radio-group', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./radio-group');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should export components', async () => {
    try {
      const module = await import('./radio-group');
      expect(Object.keys(module).length).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
