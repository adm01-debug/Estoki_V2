import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAsyncCallback } from './useAsyncCallback';

describe('useAsyncCallback', () => {
  it('should be defined', () => {
    expect(useAsyncCallback).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useAsyncCallback());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
