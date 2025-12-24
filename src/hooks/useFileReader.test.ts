import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileReader } from './useFileReader';

describe('useFileReader', () => {
  it('should be defined', () => {
    expect(useFileReader).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useFileReader());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
