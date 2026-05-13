import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrintPreview } from './PrintPreview';

describe('PrintPreview', () => {
  it('should render without crashing', () => {
    render(<PrintPreview />);
  });

  it('should render children and title', () => {
    render(<PrintPreview title="My Preview">Content</PrintPreview>);
    expect(screen.getByText('My Preview')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(<PrintPreview onClose={handleClose}>Content</PrintPreview>);
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(b => b.querySelector('.lucide-x'));
    if (closeBtn) fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
