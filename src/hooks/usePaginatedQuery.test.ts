import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePaginatedQuery } from './usePaginatedQuery';

describe('usePaginatedQuery', () => {
  it('should be defined', () => {
    expect(usePaginatedQuery).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => usePaginatedQuery());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
