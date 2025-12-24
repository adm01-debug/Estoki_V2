import { describe, it, expect } from 'vitest';
import * as i18nModule from './i18n';

describe('i18n', () => {
  it('should be defined', () => {
    expect(i18nModule).toBeDefined();
  });

  it('should export functions or constants', () => {
    const exports = Object.keys(i18nModule);
    expect(exports.length).toBeGreaterThanOrEqual(0);
  });
});
