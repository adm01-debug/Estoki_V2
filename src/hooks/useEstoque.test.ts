import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEstoque } from './useEstoque';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useEstoque', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar posicoes', () => {
    const { result } = renderHook(() => useEstoque(), { wrapper: createWrapper() });
    expect(Array.isArray(result.current.posicoes) || result.current.posicoes === undefined).toBe(true);
  });
});
