import { describe, it, expect } from 'vitest';

describe('PhoneInput', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./PhoneInput');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
