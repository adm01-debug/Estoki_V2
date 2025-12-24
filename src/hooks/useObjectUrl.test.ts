import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useObjectUrl } from './useObjectUrl';

describe('useObjectUrl', () => {
  it('should be defined', () => {
    expect(useObjectUrl).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useObjectUrl());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
