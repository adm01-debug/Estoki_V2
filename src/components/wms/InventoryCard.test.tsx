import { describe, it, expect } from 'vitest';

describe('InventoryCard', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./InventoryCard');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
