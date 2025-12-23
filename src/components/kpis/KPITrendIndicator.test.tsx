import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KPITrendIndicator from './KPITrendIndicator';
describe('KPITrendIndicator', () => {
  it('should render', () => {
    const { container } = render(<KPITrendIndicator trend="up" value={10} />);
    expect(container).toBeInTheDocument();
  });
});
