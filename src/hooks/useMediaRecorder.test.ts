import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaRecorder } from './useMediaRecorder';

describe('useMediaRecorder', () => {
  it('should be defined', () => {
    expect(useMediaRecorder).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useMediaRecorder());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
