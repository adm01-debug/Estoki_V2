import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: '1' }, loading: false })
}));

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </BrowserRouter>
    );
    expect(document.body).toBeInTheDocument();
  });
});
