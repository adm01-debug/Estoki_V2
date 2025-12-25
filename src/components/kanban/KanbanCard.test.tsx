import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanCard from './KanbanCard';

describe('KanbanCard', () => {
  it('should render card title', () => {
    render(<KanbanCard title="Test Card" id="1" />);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  it('should render card description', () => {
    render(<KanbanCard title="Card" id="1" description="Card description" />);
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<KanbanCard title="Card" id="1" onClick={onClick} />);
    fireEvent.click(screen.getByText('Card'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should render tags', () => {
    render(<KanbanCard title="Card" id="1" tags={['urgent', 'bug']} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
  });

  it('should render assignee avatar', () => {
    render(<KanbanCard title="Card" id="1" assignee={{ name: 'John', avatar: '/avatar.jpg' }} />);
    expect(screen.getByAltText('John')).toBeInTheDocument();
  });

  it('should show due date', () => {
    render(<KanbanCard title="Card" id="1" dueDate="2024-12-31" />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    const { container } = render(<KanbanCard title="Card" id="1" className="custom-card" />);
    expect(container.firstChild).toHaveClass('custom-card');
  });
});
