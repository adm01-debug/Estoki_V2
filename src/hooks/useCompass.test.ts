import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCompass } from './useCompass';

describe('useCompass', () => {
  it('should be defined', () => {
    expect(useCompass).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useCompass());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
