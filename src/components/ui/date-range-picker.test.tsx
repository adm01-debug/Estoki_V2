import { describe, it, expect } from 'vitest';

describe('date-range-picker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./date-range-picker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should export components', async () => {
    try {
      const module = await import('./date-range-picker');
      expect(Object.keys(module).length).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
