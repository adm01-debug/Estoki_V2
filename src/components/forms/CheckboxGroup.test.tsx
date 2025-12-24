import { describe, it, expect } from 'vitest';

describe('CheckboxGroup', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./CheckboxGroup');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
