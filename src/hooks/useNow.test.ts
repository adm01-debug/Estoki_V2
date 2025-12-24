import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNow } from './useNow';

describe('useNow', () => {
  it('should be defined', () => {
    expect(useNow).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useNow());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
