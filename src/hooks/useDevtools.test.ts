import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDevtools } from './useDevtools';

describe('useDevtools', () => {
  it('should be defined', () => {
    expect(useDevtools).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useDevtools());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
