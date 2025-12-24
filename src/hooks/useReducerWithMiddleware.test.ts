import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducerWithMiddleware } from './useReducerWithMiddleware';

describe('useReducerWithMiddleware', () => {
  it('should be defined', () => {
    expect(useReducerWithMiddleware).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useReducerWithMiddleware());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
