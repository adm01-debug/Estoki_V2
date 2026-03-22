import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SimplePieChart } from './SimplePieChart';

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

describe('SimplePieChart', () => {
  it('should render without errors', () => {
    const { container } = render(<SimplePieChart data={[]} />);
    expect(container).toBeInTheDocument();
  });
});
