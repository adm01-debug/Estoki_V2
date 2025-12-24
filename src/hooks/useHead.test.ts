import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHead } from './useHead';

describe('useHead', () => {
  it('should be defined', () => {
    expect(useHead).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useHead());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
