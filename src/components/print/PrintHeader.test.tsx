import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrintHeader from './PrintHeader';

describe('PrintHeader', () => {
  it('should render without crashing', () => {
    render(<PrintHeader />);
  });

  it('should render children', () => {
    render(<PrintHeader><div>Print Content</div></PrintHeader>);
    expect(screen.getByText('Print Content')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<PrintHeader className="print-class" />);
    expect(container.firstChild).toHaveClass('print-class');
  });

  it('should apply print-only styles', () => {
    const { container } = render(<PrintHeader printOnly />);
    expect(container.firstChild).toHaveClass('print-only');
  });

  it('should handle page break settings', () => {
    const { container } = render(<PrintHeader pageBreak="before" />);
    expect(container.firstChild).toHaveStyle({ pageBreakBefore: 'always' });
  });
});
