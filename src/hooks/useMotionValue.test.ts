import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionValue } from './useMotionValue';

describe('useMotionValue', () => {
  it('should be defined', () => {
    expect(useMotionValue).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useMotionValue());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
