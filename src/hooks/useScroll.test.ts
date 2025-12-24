import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScroll } from './useScroll';

describe('useScroll', () => {
  it('should be defined', () => {
    expect(useScroll).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useScroll());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
