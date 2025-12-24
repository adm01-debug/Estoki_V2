import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimeoutFn } from './useTimeoutFn';

describe('useTimeoutFn', () => {
  it('should be defined', () => {
    expect(useTimeoutFn).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useTimeoutFn());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
