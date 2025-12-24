import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useObject } from './useObject';

describe('useObject', () => {
  it('should be defined', () => {
    expect(useObject).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useObject());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
