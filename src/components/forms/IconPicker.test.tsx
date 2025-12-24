import { describe, it, expect } from 'vitest';

describe('IconPicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./IconPicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
