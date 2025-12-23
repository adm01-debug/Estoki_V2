import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('LoginForm', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><LoginForm /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
