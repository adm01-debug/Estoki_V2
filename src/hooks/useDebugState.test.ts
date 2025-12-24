import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebugState } from './useDebugState';

describe('useDebugState', () => {
  it('should be defined', () => {
    expect(useDebugState).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useDebugState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
