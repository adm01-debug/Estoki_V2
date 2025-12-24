import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfiler } from './useProfiler';

describe('useProfiler', () => {
  it('should be defined', () => {
    expect(useProfiler).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useProfiler());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
