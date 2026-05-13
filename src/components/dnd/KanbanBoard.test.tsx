import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KanbanBoard } from './KanbanBoard';

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  closestCorners: vi.fn(),
}));

describe('KanbanBoard', () => {
  it('renders children correctly', () => {
    render(<KanbanBoard onDragEnd={() => {}}><div>Board Content</div></KanbanBoard>);
    expect(screen.getByText('Board Content')).toBeInTheDocument();
  });
});
