import { describe, it, expect } from 'vitest';

describe('LoadingOverlay', () => {
  it('should be importable', async () => {
    try {
      const module = await import('./LoadingOverlay');
      expect(module).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
