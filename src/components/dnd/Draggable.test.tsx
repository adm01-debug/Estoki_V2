import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Draggable } from './Draggable';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  })),
}));

describe('Draggable', () => {
  it('renders children correctly', () => {
    render(<Draggable id="test-id"><span>Content</span></Draggable>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
