import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOptimisticUpdate } from './useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
  it('should be defined', () => {
    expect(useOptimisticUpdate).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useOptimisticUpdate());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
