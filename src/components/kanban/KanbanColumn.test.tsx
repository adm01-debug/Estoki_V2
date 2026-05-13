import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanColumn } from './KanbanColumn';
import { Layout } from 'lucide-react';
import React from 'react';

// Mock sem usar React no escopo da factory do vi.mock para evitar hoisting errors
vi.mock('./LoteCard', () => ({
  LoteCard: ({ lote, onClick }: any) => (
    <div data-testid="lote-card" onClick={onClick}>{lote.id}</div>
  )
}));

describe('KanbanColumn', () => {
  const mockColumn = {
    id: 'col1',
    title: 'To Do',
    description: 'Tasks to be done',
    icon: Layout,
    color: '#000',
    bgClass: 'bg-blue-50',
    items: [{ id: 'lote1' }]
  };

  it('renders title and items count', () => {
    render(<KanbanColumn column={mockColumn} onLoteClick={() => {}} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTestId('lote-card')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    const emptyColumn = { ...mockColumn, items: [] };
    render(<KanbanColumn onLoteClick={() => {}} column={emptyColumn} />);
    expect(screen.getByText('Nenhum lote')).toBeInTheDocument();
  });
});
