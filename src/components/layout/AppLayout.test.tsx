import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' }, loading: false }),
}));

describe('AppLayout', () => {
  it('should render children', () => {
    render(
      <BrowserRouter>
        <AppLayout>
          <div data-testid="child">Content</div>
        </AppLayout>
      </BrowserRouter>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
