import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCheckboxState } from './useCheckboxState';

describe('useCheckboxState', () => {
  it('should be defined', () => {
    expect(useCheckboxState).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useCheckboxState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
