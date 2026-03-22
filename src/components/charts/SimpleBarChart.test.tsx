import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SimpleBarChart } from './SimpleBarChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: () => <div>BarChart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
  CartesianGrid: () => null,
}));

describe('SimpleBarChart', () => {
  it('should render without errors', () => {
    const { container } = render(<SimpleBarChart data={[]} />);
    expect(container).toBeInTheDocument();
  });
});
