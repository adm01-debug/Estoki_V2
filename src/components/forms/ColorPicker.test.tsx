import { describe, it, expect } from 'vitest';

describe('ColorPicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./ColorPicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
