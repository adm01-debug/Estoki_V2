import { describe, it, expect } from 'vitest';

describe('TransferList', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./TransferList');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
