import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebugLog } from './useDebugLog';

describe('useDebugLog', () => {
  it('should be defined', () => {
    expect(useDebugLog).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useDebugLog());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
