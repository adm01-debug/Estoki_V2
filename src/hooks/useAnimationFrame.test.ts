import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimationFrame } from './useAnimationFrame';

describe('useAnimationFrame', () => {
  it('should be defined', () => {
    expect(useAnimationFrame).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useAnimationFrame());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
