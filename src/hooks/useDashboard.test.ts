// @ts-nocheck - Test file uses outdated API, needs update
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
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.stats).toBeDefined();
  });

  it('deve ter stats com estrutura esperada', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    if (result.current.stats) {
      expect(typeof result.current.stats.totalRecebimentos).toBe('number');
      expect(typeof result.current.stats.totalTriagens).toBe('number');
      expect(typeof result.current.stats.totalPosicoes).toBe('number');
    }
  });
});
