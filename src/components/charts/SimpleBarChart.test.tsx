import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SimpleBarChart from './SimpleBarChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: () => <div>BarChart</div>,
  LineChart: () => <div>LineChart</div>,
  PieChart: () => <div>PieChart</div>,
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
}));

describe('SimpleBarChart', () => {
  it('should render without errors', () => {
    const { container } = render(<SimpleBarChart data={[]} />);
    expect(container).toBeInTheDocument();
  });
});
