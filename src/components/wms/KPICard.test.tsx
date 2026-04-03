import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICard } from '../dashboard/KPICard';
import { Package, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('KPICard component', () => {
  it('renders value and label', () => {
    render(<KPICard icon={Package} value={42} label="Produtos" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<KPICard icon={Package} value="R$ 1.200" label="Receita" />);
    expect(screen.getByText('R$ 1.200')).toBeInTheDocument();
  });

  it('renders sublabel when provided', () => {
    render(<KPICard icon={Package} value={10} label="Estoque" sublabel="unidades disponíveis" />);
    expect(screen.getByText('unidades disponíveis')).toBeInTheDocument();
  });

  it('does not render sublabel when not provided', () => {
    render(<KPICard icon={Package} value={10} label="Estoque" />);
    expect(screen.queryByText('unidades disponíveis')).not.toBeInTheDocument();
  });

  // ─── Accessibility ───
  it('has correct aria-label with value and label', () => {
    render(<KPICard icon={Package} value={42} label="Produtos" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Produtos: 42');
  });

  it('includes sublabel in aria-label when present', () => {
    render(<KPICard icon={Package} value={5} label="Alertas" sublabel="críticos" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Alertas - críticos: 5');
  });

  // ─── Variants ───
  it.each(['default', 'warning', 'success', 'danger'] as const)(
    'renders with variant "%s" without crashing',
    (variant) => {
      const { container } = render(<KPICard icon={Package} value={1} label="Test" variant={variant} />);
      expect(container.firstChild).toBeTruthy();
    }
  );

  // ─── Sizes ───
  it.each(['sm', 'md', 'lg'] as const)(
    'renders with size "%s"',
    (size) => {
      const { container } = render(<KPICard icon={Package} value={1} label="Test" size={size} />);
      expect(container.firstChild).toBeTruthy();
    }
  );

  // ─── Trend ───
  it('renders upward trend', () => {
    render(<KPICard icon={TrendingUp} value={100} label="Vendas" trend={{ value: 12, isUp: true }} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('renders downward trend', () => {
    render(<KPICard icon={AlertTriangle} value={5} label="Erros" trend={{ value: 3, isUp: false }} />);
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  // ─── Click handler ───
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<KPICard icon={Package} value={1} label="Test" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is clickable even without onClick (button element)', () => {
    render(<KPICard icon={Package} value={1} label="Test" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
