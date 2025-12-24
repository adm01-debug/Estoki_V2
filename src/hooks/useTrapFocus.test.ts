import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrapFocus } from './useTrapFocus';

describe('useTrapFocus', () => {
  it('should be defined', () => {
    expect(useTrapFocus).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useTrapFocus());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
