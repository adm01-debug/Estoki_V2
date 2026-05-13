import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanCard } from './KanbanCard';

describe('KanbanCard', () => {
  it('renders title and description', () => {
    render(<KanbanCard id="1" title="Test Card" description="Test Description" />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<KanbanCard id="1" title="Test Card" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Test Card'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders labels and priority correctly', () => {
    const labels = [{ text: 'UI', color: 'blue' }];
    render(<KanbanCard id="1" title="Test" labels={labels} priority="high" />);
    expect(screen.getByText('UI')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
