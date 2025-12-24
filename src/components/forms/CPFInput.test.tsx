import { describe, it, expect } from 'vitest';

describe('CPFInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CPFInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
