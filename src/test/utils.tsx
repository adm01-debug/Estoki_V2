import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Fresh QueryClient per render to avoid test pollution
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Mock data factories
export const createMockProduct = (overrides = {}) => ({
  id: crypto.randomUUID(),
  sku: 'PROD-001',
  name: 'Produto Teste',
  description: 'Descrição do produto teste',
  category_id: crypto.randomUUID(),
  unit_id: crypto.randomUUID(),
  barcode: '7891234567890',
  min_stock: 10,
  max_stock: 100,
  cost_price: 50.00,
  sell_price: 99.90,
  is_active: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockLocation = (overrides = {}) => ({
  id: crypto.randomUUID(),
  code: 'ARM-A-01-01',
  name: 'Prateleira A1',
  zone: 'A',
  aisle: '01',
  rack: '01',
  level: '01',
  type: 'storage',
  capacity: 100,
  is_active: true,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: crypto.randomUUID(),
  email: 'user@test.com',
  full_name: 'Usuário Teste',
  role: 'operator',
  is_active: true,
  ...overrides,
});

export const createMockStockMovement = (overrides = {}) => ({
  id: crypto.randomUUID(),
  product_id: crypto.randomUUID(),
  from_location_id: null,
  to_location_id: crypto.randomUUID(),
  quantity: 10,
  type: 'in',
  created_at: new Date().toISOString(),
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
