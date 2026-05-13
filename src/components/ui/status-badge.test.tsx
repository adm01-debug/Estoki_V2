import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders standard status correctly', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Concluido')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<StatusBadge status="pending" label="Aguardando" />);
    expect(screen.getByText('Aguardando')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<StatusBadge status="error" size="lg" />);
    expect(container.firstChild).toHaveClass('text-base');
  });

  it('renders dot when prop is passed', () => {
    const { container } = render(<StatusBadge status="completed" dot />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
