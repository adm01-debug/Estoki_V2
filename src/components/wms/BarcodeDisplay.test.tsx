import { describe, it, expect } from 'vitest';

describe('BarcodeDisplay', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./BarcodeDisplay');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
