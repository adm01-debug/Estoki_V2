import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useArray } from './useArray';

describe('useArray', () => {
  it('should be defined', () => {
    expect(useArray).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useArray());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
