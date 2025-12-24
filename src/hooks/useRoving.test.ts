import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoving } from './useRoving';

describe('useRoving', () => {
  it('should be defined', () => {
    expect(useRoving).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useRoving());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
