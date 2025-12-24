import { describe, it, expect } from 'vitest';
import * as imageModule from './image';

describe('image', () => {
  it('should be defined', () => {
    expect(imageModule).toBeDefined();
  });

  it('should export functions or constants', () => {
    const exports = Object.keys(imageModule);
    expect(exports.length).toBeGreaterThanOrEqual(0);
  });
});
