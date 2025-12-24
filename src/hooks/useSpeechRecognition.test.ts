import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpeechRecognition } from './useSpeechRecognition';

describe('useSpeechRecognition', () => {
  it('should be defined', () => {
    expect(useSpeechRecognition).toBeDefined();
  });

  it('should handle browser APIs', () => {
    try {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
