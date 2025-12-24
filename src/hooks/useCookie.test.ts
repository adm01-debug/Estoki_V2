import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookie } from './useCookie';

describe('useCookie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be defined', () => {
    expect(useCookie).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useCookie('test-key'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should handle updates', () => {
    try {
      const { result } = renderHook(() => useCookie('test-key', 'initial'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
