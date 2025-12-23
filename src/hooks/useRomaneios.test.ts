import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRomaneios } from './useRomaneios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children)
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

describe('useRomaneios', () => {
  it('should return romaneios state', () => {
    const { result } = renderHook(() => useRomaneios(), { wrapper });
    expect(result.current.romaneios).toBeDefined();
  });
});
