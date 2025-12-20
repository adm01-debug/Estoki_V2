import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTriagemTimer } from '../useTriagemTimer';

describe('useTriagemTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve iniciar com estado parado', () => {
    const { result } = renderHook(() => useTriagemTimer());

    expect(result.current.iniciado).toBe(false);
    expect(result.current.pausado).toBe(false);
    expect(result.current.tempoDecorrido).toBe(0);
  });

  it('deve iniciar timer quando iniciar é chamado', () => {
    const { result } = renderHook(() => useTriagemTimer());

    act(() => {
      result.current.iniciar();
    });

    expect(result.current.iniciado).toBe(true);
    expect(result.current.pausado).toBe(false);
  });

  it('deve pausar timer quando pausar é chamado', () => {
    const { result } = renderHook(() => useTriagemTimer());

    act(() => {
      result.current.iniciar();
    });

    act(() => {
      result.current.pausar();
    });

    expect(result.current.pausado).toBe(true);
  });

  it('deve formatar tempo corretamente', () => {
    const { result } = renderHook(() => useTriagemTimer());

    expect(result.current.tempoFormatado).toBe('00:00');
  });
});
