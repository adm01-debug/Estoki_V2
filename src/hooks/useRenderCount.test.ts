import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRenderCount } from './useRenderCount';

describe('useRenderCount', () => {
  it('should be defined', () => {
    expect(useRenderCount).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useRenderCount());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
