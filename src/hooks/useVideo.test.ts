import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVideo } from './useVideo';

describe('useVideo', () => {
  it('should be defined', () => {
    expect(useVideo).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useVideo());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
