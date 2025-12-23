import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrocasDevolucoes } from './useTrocasDevolucoes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children)
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

describe('useTrocasDevolucoes', () => {
  it('should return trocas state', () => {
    const { result } = renderHook(() => useTrocasDevolucoes(), { wrapper });
    expect(result.current.trocas).toBeDefined();
  });
});
