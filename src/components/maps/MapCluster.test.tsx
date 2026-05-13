import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapCluster } from './MapCluster';

describe('MapCluster', () => {
  it('renders count correctly', () => {
    render(<MapCluster position={[0, 0]} count={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
