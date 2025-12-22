import { describe, it, expect } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  it('should have storage methods', () => {
    expect(storage.get).toBeDefined();
    expect(storage.set).toBeDefined();
    expect(storage.remove).toBeDefined();
  });
});
