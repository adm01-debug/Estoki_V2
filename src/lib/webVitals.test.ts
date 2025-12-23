import { describe, it, expect } from 'vitest';
import { reportWebVitals, measurePageLoad } from './webVitals';

describe('webVitals', () => {
  it('should have reportWebVitals function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  it('should measure page load', () => {
    const result = measurePageLoad();
    expect(typeof result).toBe('number');
  });
});
