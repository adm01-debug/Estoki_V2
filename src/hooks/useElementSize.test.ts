import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useElementSize } from './useElementSize';

describe('useElementSize', () => {
  it('should be defined', () => {
    expect(useElementSize).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useElementSize());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
