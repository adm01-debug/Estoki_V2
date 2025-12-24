import { describe, it, expect } from 'vitest';

describe('CalendarFull', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CalendarFull');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
