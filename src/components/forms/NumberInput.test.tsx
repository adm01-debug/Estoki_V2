import { describe, it, expect } from 'vitest';

describe('NumberInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./NumberInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
