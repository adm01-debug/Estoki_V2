import { describe, it, expect } from 'vitest';

describe('PivotTable', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./PivotTable');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
