import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sortable } from './Sortable';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(),
    },
  },
}));

describe('Sortable', () => {
  it('renders children correctly', () => {
    render(<Sortable id="test-id"><span>Sort Item</span></Sortable>);
    expect(screen.getByText('Sort Item')).toBeInTheDocument();
  });
});
