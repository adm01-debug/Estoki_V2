import { describe, it, expect } from 'vitest';
import * as Utils from './index';

describe('Utils Index', () => {
  it('should export utility functions', () => {
    const exports = Object.keys(Utils);
    expect(exports.length).toBeGreaterThan(0);
  });

  it('should export common utilities', () => {
    expect(Utils.cn || Utils.formatDate || Utils.debounce).toBeDefined();
  });
});
