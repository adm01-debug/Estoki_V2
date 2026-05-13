import { renderHook } from '@testing-library/react';
import { useAriaDescribedBy } from './useAriaDescribedBy';
import { describe, it, expect } from 'vitest';

describe('useAriaDescribedBy', () => {
  it('should return combined IDs', () => {
    const { result } = renderHook(() => useAriaDescribedBy(['id1', 'id2', 'id3']));
    expect(result.current).toBe('id1 id2 id3');
  });

  it('should return empty string if no IDs provided', () => {
    const { result } = renderHook(() => useAriaDescribedBy([]));
    expect(result.current).toBe('');
  });

  it('should handle undefined or null IDs gracefully if it were to receive them', () => {
    // Note: TypeScript might complain if types are strict, but testing runtime behavior
    const { result } = renderHook(() => useAriaDescribedBy(['id1', undefined as any, 'id2']));
    expect(result.current).toContain('id1');
    expect(result.current).toContain('id2');
  });
});
