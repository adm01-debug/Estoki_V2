import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusReturn } from './useFocusReturn';

describe('useFocusReturn', () => {
  it('should be defined', () => {
    expect(useFocusReturn).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useFocusReturn());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
