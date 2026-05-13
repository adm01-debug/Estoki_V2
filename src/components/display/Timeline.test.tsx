import { render, screen } from '@testing-library/react';
import { Timeline } from './Timeline';
import { describe, it, expect } from 'vitest';

const mockItems = [
  {
    id: '1',
    title: 'Evento 1',
    description: 'Descrição 1',
    date: new Date('2024-01-01'),
    status: 'completed' as const
  },
  {
    id: '2',
    title: 'Evento 2',
    date: new Date('2024-01-02'),
    status: 'current' as const
  }
];

describe('Timeline', () => {
  it('renders vertical timeline by default', () => {
    render(<Timeline items={mockItems} />);
    expect(screen.getByText('Evento 1')).toBeInTheDocument();
    expect(screen.getByText('Descrição 1')).toBeInTheDocument();
    expect(screen.getByText('Evento 2')).toBeInTheDocument();
  });

  it('renders horizontal timeline when specified', () => {
    render(<Timeline items={mockItems} orientation="horizontal" />);
    expect(screen.getByText('Evento 1')).toBeInTheDocument();
    expect(screen.getByText('Evento 2')).toBeInTheDocument();
  });

  it('renders user information if provided', () => {
    const itemsWithUser = [
      {
        ...mockItems[0],
        user: { name: 'João Silva', avatar: 'avatar.png' }
      }
    ];
    render(<Timeline items={itemsWithUser} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });
});
