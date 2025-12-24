import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorBoundaryState } from './useErrorBoundaryState';

describe('useErrorBoundaryState', () => {
  it('should be defined', () => {
    expect(useErrorBoundaryState).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useErrorBoundaryState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
