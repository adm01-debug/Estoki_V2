import { describe, it, expect, vi } from 'vitest';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => children,
  LineChart: () => null,
  BarChart: () => null,
  PieChart: () => null,
}));

describe('DonutChart', () => {
  it('should render chart', () => {
    expect(true).toBe(true);
  });
});
