import { describe, it, expect } from 'vitest';
import * as Lib from './index';

describe('Lib Index', () => {
  it('should export utility functions', () => {
    const exports = Object.keys(Lib);
    expect(exports.length).toBeGreaterThan(0);
  });

  it('should export cn function', () => {
    expect(Lib.cn).toBeDefined();
  });

  it('should export formatters', () => {
    expect(Lib.formatCurrency || Lib.formatDate).toBeDefined();
  });

  it('should export validators', () => {
    expect(Lib.validateEmail || Lib.validateCPF).toBeDefined();
  });
});
