import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
describe('ThemeProvider', () => {
  it('should render children', () => {
    render(<ThemeProvider><div>Content</div></ThemeProvider>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
