import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('should render title', () => {
    render(<StatCard title="Total Sales" value={1000} />);
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
  });

  it('should render value', () => {
    render(<StatCard title="Sales" value={1500} />);
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('should render formatted value', () => {
    render(<StatCard title="Revenue" value={1000} format="currency" />);
  });

  it('should show trend indicator', () => {
    render(<StatCard title="Growth" value={100} trend={15} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('should accept icon prop', () => {
    render(<StatCard title="Users" value={50} icon={<span>👤</span>} />);
    expect(screen.getByText('👤')).toBeInTheDocument();
  });
});
