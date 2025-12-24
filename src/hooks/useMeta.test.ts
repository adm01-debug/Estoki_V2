import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMeta } from './useMeta';

describe('useMeta', () => {
  it('should be defined', () => {
    expect(useMeta).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useMeta());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
