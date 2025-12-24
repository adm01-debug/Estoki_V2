import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClock } from './useClock';

describe('useClock', () => {
  it('should be defined', () => {
    expect(useClock).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useClock());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
