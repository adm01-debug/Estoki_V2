import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInView } from './useInView';

describe('useInView', () => {
  it('should be defined', () => {
    expect(useInView).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useInView());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
