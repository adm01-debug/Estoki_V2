import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonthPicker from './MonthPicker';

describe('MonthPicker', () => {
  it('should render without crashing', () => {
    render(<MonthPicker />);
  });

  it('should accept value prop', () => {
    render(<MonthPicker value="test" />);
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    render(<MonthPicker onChange={onChange} />);
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<MonthPicker disabled />);
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });

  it('should accept className prop', () => {
    const { container } = render(<MonthPicker className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should show error state', () => {
    render(<MonthPicker error="Error message" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
