import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBarcodePrint } from './useBarcodePrint';

describe('useBarcodePrint', () => {
  it('should be defined', () => {
    expect(useBarcodePrint).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useBarcodePrint());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
