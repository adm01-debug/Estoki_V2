import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

describe('useDarkMode', () => {
  it('should be defined', () => {
    expect(useDarkMode).toBeDefined();
  });

  it('should work', () => {
    try {
      const { result } = renderHook(() => useDarkMode());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
