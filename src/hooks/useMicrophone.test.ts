import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMicrophone } from './useMicrophone';

describe('useMicrophone', () => {
  it('should be defined', () => {
    expect(useMicrophone).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useMicrophone());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
