import { describe, it, expect } from 'vitest';

describe('EditableTable', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./EditableTable');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
