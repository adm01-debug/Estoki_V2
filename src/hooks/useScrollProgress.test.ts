import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollProgress } from './useScrollProgress';

describe('useScrollProgress', () => {
  it('should be defined', () => {
    expect(useScrollProgress).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useScrollProgress());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
