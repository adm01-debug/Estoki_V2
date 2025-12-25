import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapContainer from './MapContainer';

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    remove: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  marker: vi.fn(() => ({ addTo: vi.fn(), bindPopup: vi.fn() })),
  icon: vi.fn(),
  polyline: vi.fn(() => ({ addTo: vi.fn() })),
}));

describe('MapContainer', () => {
  it('should render without crashing', () => {
    render(<MapContainer />);
  });

  it('should accept className prop', () => {
    const { container } = render(<MapContainer className="custom-map" />);
    expect(container.firstChild).toHaveClass('custom-map');
  });

  it('should handle missing data gracefully', () => {
    render(<MapContainer data={null} />);
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<MapContainer ref={ref} />);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<MapContainer />);
    unmount();
  });
});
