import { describe, it, expect } from 'vitest';
import { measurePerformance, getMetrics } from './performance';

describe('performance', () => {
  it('should measure performance', () => {
    expect(measurePerformance).toBeDefined();
  });
});
