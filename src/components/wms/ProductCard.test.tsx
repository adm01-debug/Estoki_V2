import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProps = {
    name: 'Test Product',
    sku: 'SKU-123',
    quantity: 10,
    unit: 'un',
    status: 'active' as const,
    onClick: vi.fn(),
  };

  it('renders product details correctly', () => {
    render(<ProductCard {...mockProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('SKU-123')).toBeInTheDocument();
    expect(screen.getByText('10 un')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<ProductCard {...mockProps} />);
    fireEvent.click(screen.getByText('Test Product').closest('.cursor-pointer')!);
    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it('shows expiration date warning when expiring soon', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    
    render(<ProductCard {...mockProps} expirationDate={soon} />);
    const dateSpan = screen.getByText(soon.toLocaleDateString('pt-BR'));
    expect(dateSpan).toHaveClass('text-yellow-600');
  });
});
