import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';
import { describe, it, expect, vi } from 'vitest';

describe('UserCard', () => {
  const mockUser = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'Administrador',
    status: 'online' as const
  };

  it('renders user information correctly', () => {
    render(<UserCard {...mockUser} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<UserCard {...mockUser} onClick={onClick} />);
    fireEvent.click(screen.getByText('João Silva').closest('div[role="status"]') || screen.getByText('João Silva').closest('.card') || document.body.querySelector('.transition-shadow')!);
    // Searching for the card container
    const card = screen.getByText('João Silva').closest('.transition-shadow');
    if (card) fireEvent.click(card);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders optional fields like department and location', () => {
    render(<UserCard {...mockUser} department="Logística" location="São Paulo" />);
    expect(screen.getByText('Logística')).toBeInTheDocument();
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
  });
});
