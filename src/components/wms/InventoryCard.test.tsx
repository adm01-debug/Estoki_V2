import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InventoryCard } from './InventoryCard';

describe('InventoryCard', () => {
  const mockProps = {
    productName: 'Inventory Item',
    sku: 'INV-001',
    available: 50,
    reserved: 10,
    total: 60,
    onClick: vi.fn(),
  };

  it('renders inventory quantities correctly', () => {
    render(<InventoryCard {...mockProps} />);
    
    expect(screen.getByText('Inventory Item')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Disponível
    expect(screen.getByText('10')).toBeInTheDocument(); // Reservado
    expect(screen.getByText('60')).toBeInTheDocument(); // Total
  });

  it('shows low stock badge when total <= reorderPoint', () => {
    render(<InventoryCard {...mockProps} total={5} reorderPoint={10} />);
    expect(screen.getByText('Estoque Baixo')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<InventoryCard {...mockProps} />);
    fireEvent.click(screen.getByText('Inventory Item').closest('.cursor-pointer')!);
    expect(mockProps.onClick).toHaveBeenCalled();
  });
});
