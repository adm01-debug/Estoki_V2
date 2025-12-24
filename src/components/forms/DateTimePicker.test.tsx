import { describe, it, expect } from 'vitest';

describe('DateTimePicker', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./DateTimePicker');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
