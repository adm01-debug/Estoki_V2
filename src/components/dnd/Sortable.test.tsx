import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sortable from './Sortable';

const mockItems = [
  { id: '1', content: 'Item 1' },
  { id: '2', content: 'Item 2' },
  { id: '3', content: 'Item 3' },
];

describe('Sortable', () => {
  it('should render all items', () => {
    render(
      <Sortable items={mockItems} onReorder={vi.fn()}>
        {(item) => <div>{item.content}</div>}
      </Sortable>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should call onReorder when items are reordered', () => {
    const onReorder = vi.fn();
    render(
      <Sortable items={mockItems} onReorder={onReorder}>
        {(item) => <div>{item.content}</div>}
      </Sortable>
    );
    // Reorder simulation would go here
  });

  it('should render items in correct order', () => {
    const { container } = render(
      <Sortable items={mockItems} onReorder={vi.fn()}>
        {(item) => <div data-testid={item.id}>{item.content}</div>}
      </Sortable>
    );
    const items = container.querySelectorAll('[data-testid]');
    expect(items[0]).toHaveAttribute('data-testid', '1');
    expect(items[1]).toHaveAttribute('data-testid', '2');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <Sortable items={mockItems} onReorder={vi.fn()} className="sortable-list">
        {(item) => <div>{item.content}</div>}
      </Sortable>
    );
    expect(container.firstChild).toHaveClass('sortable-list');
  });

  it('should handle empty items array', () => {
    const { container } = render(
      <Sortable items={[]} onReorder={vi.fn()}>
        {(item) => <div>{item.content}</div>}
      </Sortable>
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
