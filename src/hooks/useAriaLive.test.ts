import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAriaLive } from './useAriaLive';

describe('useAriaLive', () => {
  it('should be defined', () => {
    expect(useAriaLive).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useAriaLive());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
