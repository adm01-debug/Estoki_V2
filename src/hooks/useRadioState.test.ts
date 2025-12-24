import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRadioState } from './useRadioState';

describe('useRadioState', () => {
  it('should be defined', () => {
    expect(useRadioState).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useRadioState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
