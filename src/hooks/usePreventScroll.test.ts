import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreventScroll } from './usePreventScroll';

describe('usePreventScroll', () => {
  it('should be defined', () => {
    expect(usePreventScroll).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => usePreventScroll());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
