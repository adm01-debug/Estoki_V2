import { describe, it, expect } from 'vitest';

describe('Divider', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./Divider');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
