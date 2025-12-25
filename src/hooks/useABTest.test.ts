import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useABTest } from './useABTest';

describe('useABTest', () => {
  it('should return a variant', () => {
    const { result } = renderHook(() => useABTest('test-experiment'));
    expect(result.current.variant).toBeDefined();
  });

  it('should return consistent variant for same user', () => {
    const { result: r1 } = renderHook(() => useABTest('test'));
    const { result: r2 } = renderHook(() => useABTest('test'));
    expect(r1.current.variant).toBe(r2.current.variant);
  });

  it('should track exposure', () => {
    const { result } = renderHook(() => useABTest('test'));
    expect(result.current.isExposed).toBeDefined();
  });

  it('should handle multiple variants', () => {
    const { result } = renderHook(() => 
      useABTest('test', { variants: ['A', 'B', 'C'] })
    );
    expect(['A', 'B', 'C']).toContain(result.current.variant);
  });
});
