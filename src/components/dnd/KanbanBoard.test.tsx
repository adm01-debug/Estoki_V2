import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanBoard } from './KanbanBoard';

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
}));

describe('KanbanBoard', () => {
  const mockColumns = [
    { id: 'col1', title: 'To Do', items: [{ id: 'item1', title: 'Task 1' }] }
  ];

  it('renders columns and items correctly', () => {
    render(<KanbanBoard columns={mockColumns} onDragEnd={() => {}} />);
    
    expect(screen.getByText('To Do (1)')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });
});
