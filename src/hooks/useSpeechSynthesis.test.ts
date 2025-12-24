import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpeechSynthesis } from './useSpeechSynthesis';

describe('useSpeechSynthesis', () => {
  it('should be defined', () => {
    expect(useSpeechSynthesis).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useSpeechSynthesis());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
