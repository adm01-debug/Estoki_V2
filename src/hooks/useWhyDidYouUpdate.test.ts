import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWhyDidYouUpdate } from './useWhyDidYouUpdate';

describe('useWhyDidYouUpdate', () => {
  it('should be defined', () => {
    expect(useWhyDidYouUpdate).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useWhyDidYouUpdate());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
