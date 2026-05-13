import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MapMarker } from './MapMarker';

describe('MapMarker', () => {
  it('renders label when provided', () => {
    render(<MapMarker position={[0, 0]} label="Test Marker" />);
    expect(screen.getByText('Test Marker')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(<MapMarker position={[0, 0]} onClick={handleClick} />);
    const marker = container.firstChild;
    if (marker) fireEvent.click(marker);
    expect(handleClick).toHaveBeenCalled();
  });
});
