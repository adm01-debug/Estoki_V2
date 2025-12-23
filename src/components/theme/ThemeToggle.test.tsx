import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('ThemeToggle', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><ThemeToggle /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
