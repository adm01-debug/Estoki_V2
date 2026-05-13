import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './stat-card';
import { Rocket } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Orders" value="1,234" />);
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = render(<StatCard title="Test" value="0" loading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders trend correctly', () => {
    render(<StatCard title="Growth" value="50%" trend={{ value: 12 }} />);
    expect(screen.getByText('12%')).toBeInTheDocument();
    expect(screen.getByText(/vs período anterior/)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<StatCard title="Icon" value="100" icon={Rocket} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
