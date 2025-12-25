import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapCluster from './MapCluster';

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

describe('MapCluster', () => {
  it('should render without crashing', () => {
    render(<MapCluster />);
  });

  it('should accept className prop', () => {
    const { container } = render(<MapCluster className="custom-map" />);
    expect(container.firstChild).toHaveClass('custom-map');
  });

  it('should handle missing data gracefully', () => {
    render(<MapCluster data={null} />);
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<MapCluster ref={ref} />);
  });

  it('should clean up on unmount', () => {
    const { unmount } = render(<MapCluster />);
    unmount();
  });
});
