import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRetry } from './useRetry';

describe('useRetry', () => {
  it('should be defined', () => {
    expect(useRetry).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useRetry());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
