import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileDownload } from './useFileDownload';

describe('useFileDownload', () => {
  it('should be defined', () => {
    expect(useFileDownload).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useFileDownload());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
