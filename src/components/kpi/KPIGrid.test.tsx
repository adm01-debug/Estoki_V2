import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KPIGrid from './KPIGrid';

describe('KPIGrid', () => {
  it('should render without errors', () => {
    const { container } = render(<KPIGrid />);
    expect(container).toBeInTheDocument();
  });
});
