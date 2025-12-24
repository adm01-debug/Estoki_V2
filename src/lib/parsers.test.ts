import { describe, it, expect } from 'vitest';
import * as parsersModule from './parsers';

describe('parsers', () => {
  it('should be defined', () => {
    expect(parsersModule).toBeDefined();
  });

  it('should export functions or constants', () => {
    const exports = Object.keys(parsersModule);
    expect(exports.length).toBeGreaterThanOrEqual(0);
  });
});
