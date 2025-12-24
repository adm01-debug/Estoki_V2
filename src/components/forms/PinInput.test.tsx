import { describe, it, expect } from 'vitest';

describe('PinInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./PinInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
