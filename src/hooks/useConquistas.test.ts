import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConquistas } from './useConquistas';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children)
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

describe('useConquistas', () => {
  it('should initialize with empty conquistas', async () => {
    const { result } = renderHook(() => useConquistas(), { wrapper });
    expect(result.current.conquistas).toEqual([]);
  });
});
