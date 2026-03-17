import { describe, it, expect } from 'vitest';
import { offlineQueue } from './offlineQueue';

describe('offlineQueue', () => {
  it('should have queue methods', () => {
    expect(offlineQueue.add).toBeDefined();
    expect(offlineQueue.getAll).toBeDefined();
    expect(offlineQueue.remove).toBeDefined();
    expect(offlineQueue.clear).toBeDefined();
  });
});
