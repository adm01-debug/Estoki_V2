import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Recebimento from './Recebimento';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/hooks/useRecebimentos', () => ({ useRecebimentos: () => ({ lotes: [], loading: false }) }));

describe('Recebimento', () => {
  it('should render recebimento page', () => {
    render(<BrowserRouter><Recebimento /></BrowserRouter>);
    expect(document.body).toBeInTheDocument();
  });
});
