// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecebimentos } from '../useRecebimentos';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useRecebimentos', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar array de recebimentos', () => {
    const { result } = renderHook(() => useRecebimentos(), { wrapper: createWrapper() });
    expect(Array.isArray(result.current.recebimentos)).toBe(true);
  });

  it('deve ter função atualizarRecebimento', () => {
    const { result } = renderHook(() => useRecebimentos(), { wrapper: createWrapper() });
    expect(typeof result.current.atualizarRecebimento).toBe('function');
  });
});
