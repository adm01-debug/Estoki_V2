import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataGrid from './DataGrid';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'light', setTheme: vi.fn() }) }));

describe('DataGrid', () => {
  it('should render without errors', () => {
    const { container } = render(<BrowserRouter><DataGrid /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
