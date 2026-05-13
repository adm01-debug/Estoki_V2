import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapPopup } from './MapPopup';

describe('MapPopup', () => {
  it('renders children correctly', () => {
    render(<MapPopup><span>Popup Info</span></MapPopup>);
    expect(screen.getByText('Popup Info')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<MapPopup onClose={handleClose}>Content</MapPopup>);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});
