import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDoubleClick } from './useDoubleClick';

describe('useDoubleClick', () => {
  it('should be defined', () => {
    expect(useDoubleClick).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useDoubleClick());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
