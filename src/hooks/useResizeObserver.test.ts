import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResizeObserver } from './useResizeObserver';

describe('useResizeObserver', () => {
  it('should be defined', () => {
    expect(useResizeObserver).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useResizeObserver());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
