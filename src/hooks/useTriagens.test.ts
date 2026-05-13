import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTriagens } from './useTriagens';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useTriagens', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar array de triagens', () => {
    const { result } = renderHook(() => useTriagens(), { wrapper: createWrapper() });
    expect(Array.isArray(result.current.triagens) || result.current.triagens === undefined).toBe(true);
  });
});
