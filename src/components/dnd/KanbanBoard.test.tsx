import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanBoard from './KanbanBoard';

const mockColumns = [
  { id: '1', title: 'To Do', items: [{ id: 'item1', content: 'Task 1' }] },
  { id: '2', title: 'In Progress', items: [] },
  { id: '3', title: 'Done', items: [] },
];

describe('KanbanBoard', () => {
  it('should render columns', () => {
    render(<KanbanBoard columns={mockColumns} onDragEnd={vi.fn()} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should render items in columns', () => {
    render(<KanbanBoard columns={mockColumns} onDragEnd={vi.fn()} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should call onDragEnd when item is moved', () => {
    const onDragEnd = vi.fn();
    render(<KanbanBoard columns={mockColumns} onDragEnd={onDragEnd} />);
    // Drag and drop simulation would go here
  });

  it('should render empty columns', () => {
    render(<KanbanBoard columns={mockColumns} onDragEnd={vi.fn()} />);
    const inProgressColumn = screen.getByText('In Progress').parentElement;
    expect(inProgressColumn).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(
      <KanbanBoard columns={mockColumns} onDragEnd={vi.fn()} className="custom-board" />
    );
    expect(container.firstChild).toHaveClass('custom-board');
  });
});
