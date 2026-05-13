import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProdutos } from './useProdutos';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useProdutos', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar array de produtos', () => {
    const { result } = renderHook(() => useProdutos(), { wrapper: createWrapper() });
    expect(Array.isArray(result.current.produtos)).toBe(true);
  });
});
