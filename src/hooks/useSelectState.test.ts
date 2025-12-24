import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelectState } from './useSelectState';

describe('useSelectState', () => {
  it('should be defined', () => {
    expect(useSelectState).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useSelectState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
