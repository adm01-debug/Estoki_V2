import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuButton } from './MenuButton';
import { Package, Truck, Settings } from 'lucide-react';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('MenuButton component', () => {
  it('renders label text', () => {
    render(<MenuButton icon={Package} label="Produtos" />);
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<MenuButton icon={Package} label="Produtos" description="Gerenciar catálogo" />);
    expect(screen.getByText('Gerenciar catálogo')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<MenuButton icon={Package} label="Produtos" />);
    expect(screen.queryByText('Gerenciar catálogo')).not.toBeInTheDocument();
  });

  // ─── Accessibility ───
  it('has correct aria-label with label only', () => {
    render(<MenuButton icon={Package} label="Produtos" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Produtos');
  });

  it('includes description in aria-label', () => {
    render(<MenuButton icon={Truck} label="Envios" description="Controle de despachos" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Envios - Controle de despachos');
  });

  it('includes badge count in aria-label', () => {
    render(<MenuButton icon={Package} label="Tarefas" badge={5} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Tarefas (5 pendentes)');
  });

  // ─── Badge ───
  it('renders badge when count > 0', () => {
    render(<MenuButton icon={Package} label="Alertas" badge={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not render badge when count is 0', () => {
    render(<MenuButton icon={Package} label="Alertas" badge={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  // ─── Variants ───
  it.each(['default', 'primary', 'gradient'] as const)(
    'renders with variant "%s"',
    (variant) => {
      const { container } = render(<MenuButton icon={Package} label="Test" variant={variant} />);
      expect(container.firstChild).toBeTruthy();
    }
  );

  // ─── Click handler ───
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon={Settings} label="Config" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
