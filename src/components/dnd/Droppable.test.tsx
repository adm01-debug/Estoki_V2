import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Droppable } from './Droppable';

vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
    active: null,
  })),
}));

describe('Droppable', () => {
  it('renders children correctly', () => {
    render(<Droppable id="test-id"><span>Drop Area</span></Droppable>);
    expect(screen.getByText('Drop Area')).toBeInTheDocument();
  });
});
