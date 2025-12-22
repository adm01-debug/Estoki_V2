import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PosicaoCard } from './PosicaoCard';

describe('PosicaoCard', () => {
  const mockPosicao = {
    id: '1',
    codigo: 'A-01-01',
    tipo: 'pallet',
    status: 'disponivel' as const,
  };

  it('should render position code', () => {
    render(<PosicaoCard posicao={mockPosicao} />);
    expect(screen.getByText('A-01-01')).toBeInTheDocument();
  });

  it('should show status', () => {
    render(<PosicaoCard posicao={mockPosicao} />);
    expect(screen.getByText(/disponivel/i)).toBeInTheDocument();
  });
});
