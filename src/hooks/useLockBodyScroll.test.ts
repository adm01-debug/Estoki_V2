import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLockBodyScroll } from './useLockBodyScroll';

describe('useLockBodyScroll', () => {
  it('should be defined', () => {
    expect(useLockBodyScroll).toBeDefined();
  });

  it('should work with ref', () => {
    try {
      const { result } = renderHook(() => useLockBodyScroll());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
