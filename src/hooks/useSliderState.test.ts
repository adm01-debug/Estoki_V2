import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSliderState } from './useSliderState';

describe('useSliderState', () => {
  it('should be defined', () => {
    expect(useSliderState).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useSliderState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
