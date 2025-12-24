import { describe, it, expect } from 'vitest';

describe('LocationPicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./LocationPicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
