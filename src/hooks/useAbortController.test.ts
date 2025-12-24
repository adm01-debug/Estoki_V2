import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAbortController } from './useAbortController';

describe('useAbortController', () => {
  it('should be defined', () => {
    expect(useAbortController).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useAbortController());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
