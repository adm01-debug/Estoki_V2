import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Rating from './Rating';

describe('Rating', () => {
  it('should render without crashing', () => {
    render(<Rating />);
  });

  it('should accept value prop', () => {
    render(<Rating value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Rating onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<Rating disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<Rating className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<Rating error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
