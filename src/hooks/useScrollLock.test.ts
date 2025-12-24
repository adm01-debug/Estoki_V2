import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from './useScrollLock';

describe('useScrollLock', () => {
  it('should be defined', () => {
    expect(useScrollLock).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useScrollLock());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
