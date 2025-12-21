// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEstoque } from '../useEstoque';
import React from 'react';

// Wrapper com QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useEstoque', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar estado inicial correto', async () => {
    const { result } = renderHook(() => useEstoque(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBeDefined();
    expect(result.current.posicoes).toBeDefined();
    expect(Array.isArray(result.current.posicoes)).toBe(true);
  });

  it('deve ter função getEstatisticas', () => {
    const { result } = renderHook(() => useEstoque(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.getEstatisticas).toBe('function');
  });

  it('deve ter função atualizarPosicao', () => {
    const { result } = renderHook(() => useEstoque(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.atualizarPosicao).toBe('function');
  });
});
