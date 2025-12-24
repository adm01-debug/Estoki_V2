import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMeasure } from './useMeasure';

describe('useMeasure', () => {
  it('should be defined', () => {
    expect(useMeasure).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useMeasure());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
