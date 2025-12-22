import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecebimentoCard } from './RecebimentoCard';

describe('RecebimentoCard', () => {
  const mockRecebimento = {
    id: '1',
    numero_nf: '12345',
    fornecedor: 'Fornecedor X',
    status: 'pendente',
  };

  it('should render NF number', () => {
    render(<RecebimentoCard recebimento={mockRecebimento} />);
    expect(screen.getByText(/12345/)).toBeInTheDocument();
  });
});
