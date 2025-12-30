import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('should render title', () => {
    render(<StatCard title="Revenue" value="$10,000" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should render value', () => {
    render(<StatCard title="Sales" value="150" />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<StatCard title="Users" value="500" icon={<span>📊</span>} />);
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('should show change percentage', () => {
    render(<StatCard title="Growth" value="80%" change={5.2} />);
    expect(screen.getByText(/5\.2/)).toBeInTheDocument();
  });
});
