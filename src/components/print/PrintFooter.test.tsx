import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrintFooter } from './PrintFooter';

describe('PrintFooter', () => {
  it('should render without crashing', () => {
    render(<PrintFooter />);
  });

  it('should render text', () => {
    render(<PrintFooter text="Footer Text" />);
    expect(screen.getByText('Footer Text')).toBeInTheDocument();
  });

  it('should show page numbers', () => {
    render(<PrintFooter pageNumber={1} totalPages={5} />);
    expect(screen.getByText(/Página 1 de 5/)).toBeInTheDocument();
  });
});
