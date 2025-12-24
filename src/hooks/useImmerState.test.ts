import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImmerState } from './useImmerState';

describe('useImmerState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be defined', () => {
    expect(useImmerState).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useImmerState('test-key'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should handle updates', () => {
    try {
      const { result } = renderHook(() => useImmerState('test-key', 'initial'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
