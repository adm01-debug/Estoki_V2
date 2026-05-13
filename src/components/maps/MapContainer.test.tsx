import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapContainer } from './MapContainer';

describe('MapContainer', () => {
  it('renders correctly with default props', () => {
    render(<MapContainer />);
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText(/Lat: -23.5505/)).toBeInTheDocument();
    expect(screen.getByText(/Lng: -46.6333/)).toBeInTheDocument();
  });

  it('renders custom height and children', () => {
    render(
      <MapContainer height="500px">
        <div data-testid="child">Map Content</div>
      </MapContainer>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    const container = screen.getByText('Mapa').parentElement?.parentElement?.parentElement;
    expect(container).toHaveStyle({ height: '500px' });
  });
});
