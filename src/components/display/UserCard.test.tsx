import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('should render without crashing', () => {
    render(<UserCard />);
  });

  it('should accept className prop', () => {
    const { container } = render(<UserCard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = { current: null };
    render(<UserCard ref={ref} />);
    expect(ref.current).not.toBeNull();
  });

  it('should handle props correctly', () => {
    const { container } = render(<UserCard data-testid="test-UserCard" />);
    expect(container.querySelector('[data-testid="test-UserCard"]')).toBeInTheDocument();
  });
});
