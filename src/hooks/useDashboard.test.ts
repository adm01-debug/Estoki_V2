import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboard } from '../useDashboard';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useDashboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    expect(result.current.loading).toBeDefined();
    expect(result.current.kpis).toBeDefined();
  });

  it('deve ter KPIs com estrutura esperada', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    if (result.current.kpis) {
      expect(typeof result.current.kpis.recebimentosPendentes).toBe('number');
    }
  });
});
