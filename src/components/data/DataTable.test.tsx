import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataTable from './DataTable';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('DataTable', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><DataTable /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
