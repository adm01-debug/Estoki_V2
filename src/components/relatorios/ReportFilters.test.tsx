import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReportFilters from './ReportFilters';
describe('ReportFilters', () => {
  it('should render', () => {
    const { container } = render(<ReportFilters onFilter={vi.fn()} />);
    expect(container).toBeInTheDocument();
  });
});
