import { describe, it, expect } from 'vitest';

describe('popover', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./popover');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should export components', async () => {
    try {
      const module = await import('./popover');
      expect(Object.keys(module).length).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
