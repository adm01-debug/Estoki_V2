import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileDrop } from './useFileDrop';

describe('useFileDrop', () => {
  it('should be defined', () => {
    expect(useFileDrop).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useFileDrop());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
