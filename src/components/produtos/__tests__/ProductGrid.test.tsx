import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../ProductGrid';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

const mockProducts = [
  { 
    id: '1', 
    nome: 'Produto 1', 
    sku: 'SKU1', 
    curva_abc: 'A', 
    unidade: 'UN', 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  },
];

describe('ProductGrid', () => {
  it('should display skeletons when loading prop is true', () => {
    render(
      <ProductGrid 
        produtos={[]} 
        loading={true} 
        onSelect={() => {}} 
        getCurvaBadge={() => null} 
      />
    );
    
    const loadingContainer = screen.getByTestId('product-grid-loading');
    expect(loadingContainer).toBeInTheDocument();
    
    // Check if there are skeleton elements (using a generic way to check for skeleton-like divs if needed)
    // Here we just verify the container exists as it's the specific test requirement
  });

  it('should display product list when loading is false and products are provided', () => {
    render(
      <ProductGrid 
        produtos={mockProducts as any} 
        loading={false} 
        onSelect={() => {}} 
        getCurvaBadge={(curva) => <span data-testid="badge">{curva}</span>} 
      />
    );
    
    expect(screen.getByTestId('product-grid-results')).toBeInTheDocument();
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
    expect(screen.getByText('SKU: SKU1')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toHaveTextContent('A');
  });

  it('should display empty state when no products and not loading', () => {
    render(
      <ProductGrid 
        produtos={[]} 
        loading={false} 
        onSelect={() => {}} 
        getCurvaBadge={() => null} 
      />
    );
    
    expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
    expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
  });
});
