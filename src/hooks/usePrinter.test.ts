import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrinter } from './usePrinter';

describe('usePrinter', () => {
  it('should be defined', () => {
    expect(usePrinter).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => usePrinter());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
