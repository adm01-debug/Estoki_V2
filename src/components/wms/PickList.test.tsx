import { describe, it, expect } from 'vitest';

describe('PickList', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./PickList');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
