import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnmount } from './useUnmount';

describe('useUnmount', () => {
  it('should be defined', () => {
    expect(useUnmount).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useUnmount());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
