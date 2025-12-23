import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RelatorioDivergencias from './RelatorioDivergencias';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })) }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
);

describe('RelatorioDivergencias Page', () => {
  it('should render without errors', () => {
    const { container } = render(<RelatorioDivergencias />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
