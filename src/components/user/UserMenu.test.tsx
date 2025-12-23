import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserMenu from './UserMenu';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' }, signOut: vi.fn() })
}));

describe('UserMenu', () => {
  it('should render user menu', () => {
    const { container } = render(<BrowserRouter><UserMenu /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
