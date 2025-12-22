import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Triagem from './Triagem';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' } }) }));
vi.mock('@/hooks/useTriagens', () => ({ useTriagens: () => ({ triagens: [], loading: false }) }));

describe('Triagem', () => {
  it('should render triagem page', () => {
    render(<BrowserRouter><Triagem /></BrowserRouter>);
    expect(document.body).toBeInTheDocument();
  });
});
