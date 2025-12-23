import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PlacarLideres from './PlacarLideres';
describe('PlacarLideres', () => {
  it('should render', () => {
    const { container } = render(<PlacarLideres />);
    expect(container).toBeInTheDocument();
  });
});
