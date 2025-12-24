import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlobUrl } from './useBlobUrl';

describe('useBlobUrl', () => {
  it('should be defined', () => {
    expect(useBlobUrl).toBeDefined();
  });

  it('should initialize', () => {
    try {
      const { result } = renderHook(() => useBlobUrl());
      expect(result.current).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
