import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BatchInfo } from './BatchInfo';

describe('BatchInfo', () => {
  const mockProps = {
    lotNumber: 'LOT-2024-001',
    productName: 'Batch Product',
    quantity: 100,
    supplierName: 'Test Supplier',
    locationCode: 'LOC-A1',
    status: 'active' as const,
  };

  it('renders batch information correctly', () => {
    render(<BatchInfo {...mockProps} />);
    
    expect(screen.getByText('LOT-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Batch Product')).toBeInTheDocument();
    expect(screen.getByText('100 unidades')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
    expect(screen.getByText('LOC-A1')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders manufacturing date in correct format', () => {
    const date = new Date(2024, 0, 15);
    render(<BatchInfo {...mockProps} manufacturingDate={date} />);
    expect(screen.getByText(/Fab: 15\/01\/2024/)).toBeInTheDocument();
  });
});
