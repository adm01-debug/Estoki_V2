import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard } from './KPICard';
import { Package, TrendingUp } from 'lucide-react';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('KPICard – Dashboard', () => {
  it('renders value and label', () => {
    render(<KPICard icon={Package} value={128} label="Total" />);
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('has aria-label with context', () => {
    render(<KPICard icon={Package} value={42} label="Produtos" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Produtos: 42');
  });

  it('shows zero value correctly', () => {
    render(<KPICard icon={Package} value={0} label="Nenhum" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders trend indicator', () => {
    render(<KPICard icon={TrendingUp} value={50} label="Vendas" trend={{ value: 10, isUp: true }} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });
});
