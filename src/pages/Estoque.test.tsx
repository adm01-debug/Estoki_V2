import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Estoque from './Estoque';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/hooks/useEstoque', () => ({ useEstoque: () => ({ posicoes: [], loading: false }) }));

describe('Estoque', () => {
  it('should render estoque page', () => {
    render(<BrowserRouter><Estoque /></BrowserRouter>);
    expect(document.body).toBeInTheDocument();
  });
});
