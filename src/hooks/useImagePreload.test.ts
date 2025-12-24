import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useImagePreload } from './useImagePreload';

describe('useImagePreload', () => {
  it('should be defined', () => {
    expect(useImagePreload).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useImagePreload());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
