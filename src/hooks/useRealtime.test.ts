import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })), removeChannel: vi.fn() }
}));

import { useRealtime } from './useRealtime';

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children);

describe('useRealtime', () => {
  it('should subscribe to realtime updates', () => {
    renderHook(() => useRealtime('test_table', ['test']), { wrapper });
  });
});
