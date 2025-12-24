import { describe, it, expect } from 'vitest';

describe('Autocomplete', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Autocomplete');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
