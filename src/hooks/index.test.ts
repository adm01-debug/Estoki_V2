import { describe, it, expect } from 'vitest';
import * as Hooks from './index';

describe('Hooks Index', () => {
  it('should export multiple hooks', () => {
    const exports = Object.keys(Hooks);
    expect(exports.length).toBeGreaterThan(50);
  });

  it('should export useAuth', () => {
    expect(Hooks.useAuth).toBeDefined();
  });

  it('should export useLocalStorage', () => {
    expect(Hooks.useLocalStorage).toBeDefined();
  });
});
