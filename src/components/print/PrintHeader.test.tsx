import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrintHeader } from './PrintHeader';

describe('PrintHeader', () => {
  it('should render without crashing', () => {
    render(<PrintHeader />);
  });

  it('should render title', () => {
    render(<PrintHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should apply className prop', () => {
    const { container } = render(<PrintHeader className="custom-header" />);
    expect(container.firstChild).toHaveClass('custom-header');
  });
});
