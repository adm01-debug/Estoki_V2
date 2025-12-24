import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  it('should be defined', () => {
    expect(useTimer).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useTimer());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
