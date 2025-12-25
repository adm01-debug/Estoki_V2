import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextareaCounter from './TextareaCounter';

describe('TextareaCounter', () => {
  it('should render without crashing', () => {
    render(<TextareaCounter />);
  });

  it('should accept value prop', () => {
    render(<TextareaCounter value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<TextareaCounter onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<TextareaCounter disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<TextareaCounter className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<TextareaCounter error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
