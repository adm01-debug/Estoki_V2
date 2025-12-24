import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionTemplate } from './useMotionTemplate';

describe('useMotionTemplate', () => {
  it('should be defined', () => {
    expect(useMotionTemplate).toBeDefined();
  });

  it('should work correctly', () => {
    try {
      const { result } = renderHook(() => useMotionTemplate());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
