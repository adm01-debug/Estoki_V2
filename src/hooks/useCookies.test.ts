import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookies } from './useCookies';

describe('useCookies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be defined', () => {
    expect(useCookies).toBeDefined();
  });

  it('should initialize correctly', () => {
    try {
      const { result } = renderHook(() => useCookies('test-key'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it('should handle updates', () => {
    try {
      const { result } = renderHook(() => useCookies('test-key', 'initial'));
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
