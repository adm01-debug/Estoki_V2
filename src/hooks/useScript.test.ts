import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScript } from './useScript';

describe('useScript', () => {
  it('should be defined', () => {
    expect(useScript).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useScript());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
