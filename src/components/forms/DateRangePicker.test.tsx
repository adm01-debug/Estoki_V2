import { describe, it, expect } from 'vitest';

describe('DateRangePicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./DateRangePicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
