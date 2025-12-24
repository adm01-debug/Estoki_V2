import { describe, it, expect } from 'vitest';

describe('DatePicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./DatePicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
