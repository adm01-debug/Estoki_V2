import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Produtos from '../Produtos';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as useProdutosHook from '@/hooks/useProdutos';
import '@testing-library/jest-dom';

vi.mock('@/hooks/useProdutos', () => ({
  useProdutos: vi.fn()
}));

vi.mock('@/hooks/useAuditLog', () => ({
  useAuditLog: () => ({ log: { custom: vi.fn() } })
}));

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children, title, rightAction }: any) => (
    <div data-testid="app-layout">
      <h1>{title}</h1>
      {rightAction}
      {children}
    </div>
  )
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('ProdutosPage Search Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display skeletons during search transition', async () => {
    const mockProducts = [
      { id: '1', nome: 'Produto Real', sku: 'REAL1', curva_abc: 'A', created_at: new Date().toISOString() }
    ];

    (useProdutosHook.useProdutos as any).mockReturnValue({
      produtos: mockProducts,
      loading: false,
      stats: { total: 1, curvaA: 1, curvaB: 0, curvaC: 0 },
      createProduto: { isPending: false }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProdutosPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Buscar por nome ou SKU/i);
    
    // Initial state: results are visible
    expect(screen.getByTestId('product-grid-results')).toBeInTheDocument();
    expect(screen.getByText('Produto Real')).toBeInTheDocument();

    // Trigger search
    fireEvent.change(searchInput, { target: { value: 'novo termo' } });

    // Skeletons should appear due to search !== debouncedSearch
    await waitFor(() => {
      expect(screen.getByTestId('product-grid-loading')).toBeInTheDocument();
    });

    // After debounce and effect finishing, results should return (or empty state if not found)
    await waitFor(() => {
      expect(screen.queryByTestId('product-grid-loading')).not.toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
