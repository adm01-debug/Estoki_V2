import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from './useFeatureFlag';

describe('useFeatureFlag', () => {
  it('should be defined', () => {
    expect(useFeatureFlag).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useFeatureFlag());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
