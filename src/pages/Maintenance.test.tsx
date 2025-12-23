import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Maintenance from './Maintenance';

describe('Maintenance', () => {
  it('should render maintenance page', () => {
    render(<Maintenance />);
    expect(screen.getByText('Em Manutenção')).toBeInTheDocument();
  });
});
