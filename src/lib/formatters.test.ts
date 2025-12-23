import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercent, formatBytes } from './formatters';

describe('formatters', () => {
  it('should format number', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('should format percent', () => {
    expect(formatPercent(50)).toContain('50');
  });

  it('should format bytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(0)).toBe('0 Bytes');
  });
});
