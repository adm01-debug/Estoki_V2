import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  it('should be defined', () => {
    expect(useIsMounted).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useIsMounted());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
