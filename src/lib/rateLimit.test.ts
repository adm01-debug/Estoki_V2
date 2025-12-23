import { describe, it, expect } from 'vitest';
import { rateLimit, clearRateLimit } from './rateLimit';

describe('rateLimit', () => {
  it('should allow requests within limit', () => {
    clearRateLimit('test');
    expect(rateLimit('test', 5, 1000)).toBe(true);
    expect(rateLimit('test', 5, 1000)).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    clearRateLimit('block');
    for (let i = 0; i < 5; i++) rateLimit('block', 5, 1000);
    expect(rateLimit('block', 5, 1000)).toBe(false);
  });
});
