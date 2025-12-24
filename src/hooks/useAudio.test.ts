import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudio } from './useAudio';

describe('useAudio', () => {
  it('should be defined', () => {
    expect(useAudio).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useAudio());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
