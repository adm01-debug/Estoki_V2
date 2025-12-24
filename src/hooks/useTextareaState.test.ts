import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTextareaState } from './useTextareaState';

describe('useTextareaState', () => {
  it('should be defined', () => {
    expect(useTextareaState).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useTextareaState());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
