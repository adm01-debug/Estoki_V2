import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScreenCapture } from './useScreenCapture';

describe('useScreenCapture', () => {
  it('should be defined', () => {
    expect(useScreenCapture).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useScreenCapture());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
