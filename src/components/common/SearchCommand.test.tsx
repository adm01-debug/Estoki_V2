import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchCommand } from './SearchCommand';

describe('SearchCommand', () => {
  it('should render search command', () => {
    const { container } = render(<BrowserRouter><SearchCommand /></BrowserRouter>);
    expect(container).toBeInTheDocument();
  });
});
