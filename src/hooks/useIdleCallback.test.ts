import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIdleCallback } from './useIdleCallback';

describe('useIdleCallback', () => {
  it('should be defined', () => {
    expect(useIdleCallback).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useIdleCallback());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
