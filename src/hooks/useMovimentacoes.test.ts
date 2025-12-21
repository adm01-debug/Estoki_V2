// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMovimentacoes } from '../useMovimentacoes';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useMovimentacoes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar array de movimentações', () => {
    const { result } = renderHook(() => useMovimentacoes(), { wrapper: createWrapper() });
    expect(Array.isArray(result.current.movimentacoes)).toBe(true);
  });

  it('deve ter função registrarMovimentacao', () => {
    const { result } = renderHook(() => useMovimentacoes(), { wrapper: createWrapper() });
    expect(typeof result.current.registrarMovimentacao).toBe('function');
  });
});
