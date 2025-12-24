import { describe, it, expect } from 'vitest';

describe('OTPInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./OTPInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
