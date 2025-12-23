import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KPICard from './KPICard';

describe('KPICard', () => {
  it('should render without errors', () => {
    const { container } = render(<KPICard />);
    expect(container).toBeInTheDocument();
  });
});
