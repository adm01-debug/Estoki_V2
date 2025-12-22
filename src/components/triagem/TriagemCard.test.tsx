import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TriagemCard } from './TriagemCard';

describe('TriagemCard', () => {
  const mockTriagem = {
    id: '1',
    lote_id: 'lote-1',
    tipo: 'entrada',
    status: 'pendente',
  };

  it('should render triagem info', () => {
    render(<TriagemCard triagem={mockTriagem} />);
    expect(screen.getByText(/pendente/i)).toBeInTheDocument();
  });
});
