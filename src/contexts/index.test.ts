import { describe, it, expect } from 'vitest';
import * as Contexts from './index';

describe('Contexts Index', () => {
  it('should export contexts', () => {
    const exports = Object.keys(Contexts);
    expect(exports.length).toBeGreaterThan(0);
  });

  it('should export AuthContext or AuthProvider', () => {
    expect(Contexts.AuthContext || Contexts.AuthProvider).toBeDefined();
  });
});
