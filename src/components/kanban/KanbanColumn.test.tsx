import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanColumn } from './KanbanColumn';
import { Layout } from 'lucide-react';
import React from 'react';

// Mock dependentes com forwardRef para evitar avisos do framer-motion
vi.mock('./LoteCard', () => ({
  LoteCard: React.forwardRef(({ lote, onClick }: any, ref: any) => (
    <div data-testid="lote-card" onClick={onClick} ref={ref}>{lote.id}</div>
  ))
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
    render(<KanbanColumn emptyColumn={emptyColumn as any} onLoteClick={() => {}} column={emptyColumn} />);
    expect(screen.getByText('Nenhum lote')).toBeInTheDocument();
  });
});
