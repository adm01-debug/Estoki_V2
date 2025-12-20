import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScanner } from '../useScanner';

describe('useScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve iniciar com estado correto', () => {
    const { result } = renderHook(() => useScanner());

    expect(result.current.isScanning).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.scanHistory).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('deve limpar resultado quando clearLastResult é chamado', () => {
    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.clearLastResult();
    });

    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('deve limpar histórico quando clearHistory é chamado', () => {
    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.scanHistory).toEqual([]);
  });

  it('deve alterar isScanning quando setScanning é chamado', () => {
    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.setScanning(false);
    });

    expect(result.current.isScanning).toBe(false);

    act(() => {
      result.current.setScanning(true);
    });

    expect(result.current.isScanning).toBe(true);
  });
});
