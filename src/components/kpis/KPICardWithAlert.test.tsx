import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import KPICardWithAlert from './KPICardWithAlert';
describe('KPICardWithAlert', () => {
  it('should render', () => {
    const { container } = render(<KPICardWithAlert title="KPI" value={100} />);
    expect(container).toBeInTheDocument();
  });
});
