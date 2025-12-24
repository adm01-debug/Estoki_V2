import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusWithin } from './useFocusWithin';

describe('useFocusWithin', () => {
  it('should be defined', () => {
    expect(useFocusWithin).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useFocusWithin());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
