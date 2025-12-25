import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanColumn from './KanbanColumn';

const mockCards = [
  { id: '1', title: 'Card 1' },
  { id: '2', title: 'Card 2' },
];

describe('KanbanColumn', () => {
  it('should render column title', () => {
    render(<KanbanColumn id="col1" title="To Do" cards={[]} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('should render cards', () => {
    render(<KanbanColumn id="col1" title="To Do" cards={mockCards} />);
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('should show card count', () => {
    render(<KanbanColumn id="col1" title="To Do" cards={mockCards} showCount />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should call onAddCard when add button is clicked', () => {
    const onAddCard = vi.fn();
    render(<KanbanColumn id="col1" title="To Do" cards={[]} onAddCard={onAddCard} />);
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(onAddCard).toHaveBeenCalled();
  });

  it('should render empty state when no cards', () => {
    render(<KanbanColumn id="col1" title="Empty" cards={[]} emptyMessage="No cards" />);
    expect(screen.getByText('No cards')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(
      <KanbanColumn id="col1" title="Column" cards={[]} className="custom-column" />
    );
    expect(container.firstChild).toHaveClass('custom-column');
  });

  it('should render with max height when specified', () => {
    const { container } = render(
      <KanbanColumn id="col1" title="Column" cards={mockCards} maxHeight={400} />
    );
    expect(container.firstChild).toHaveStyle({ maxHeight: '400px' });
  });
});
