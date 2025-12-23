import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBarcodeScanner } from './useBarcodeScanner';

describe('useBarcodeScanner', () => {
  it('should initialize with empty buffer', () => {
    const onScan = vi.fn();
    const { result } = renderHook(() => useBarcodeScanner(onScan));
    expect(result.current.buffer).toBe('');
  });
});
