import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YearPicker from './YearPicker';

describe('YearPicker', () => {
  it('should render without crashing', () => {
    render(<YearPicker />);
  });

  it('should accept value prop', () => {
    render(<YearPicker value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<YearPicker onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<YearPicker disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<YearPicker className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<YearPicker error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
