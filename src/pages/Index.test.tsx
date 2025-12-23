import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

describe('Index Page', () => {
  it('should render without crashing', () => {
    const { container } = render(<BrowserRouter><Index /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
